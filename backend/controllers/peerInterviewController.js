const { AccessToken } = require("livekit-server-sdk");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const PeerMatchPreference = require("../models/PeerMatchPreference");
const PeerInterviewRequest = require("../models/PeerInterviewRequest");
const PeerInterviewSession = require("../models/PeerInterviewSession");
const PeerUserBlock = require("../models/PeerUserBlock");
const PeerUserReport = require("../models/PeerUserReport");
const PeerMatchQueueEntry = require("../models/PeerMatchQueueEntry");

const PREFERENCE_TO_GENDER = {
  female_only: "female",
  male_only: "male",
  non_binary_only: "non_binary",
};

const getOrCreatePreference = async (userId) => {
  let preference = await PeerMatchPreference.findOne({ userId });
  if (!preference) {
    preference = await PeerMatchPreference.create({ userId });
  }
  return preference;
};

const isGenderAllowed = (preference, oppositeGender) => {
  if (!preference || preference.preferredMatch === "any") return true;

  const requiredGender = PREFERENCE_TO_GENDER[preference.preferredMatch];
  if (!requiredGender) return true;

  return oppositeGender === requiredGender;
};

const areUsersBlocked = async (userAId, userBId) => {
  const block = await PeerUserBlock.findOne({
    $or: [
      { userId: userAId, blockedUserId: userBId },
      { userId: userBId, blockedUserId: userAId },
    ],
  });

  return Boolean(block);
};

const hasSkillOverlap = (skillsA = [], skillsB = []) => {
  if (!skillsA.length || !skillsB.length) return true;
  const normalizedA = new Set(
    skillsA.map((skill) => String(skill).toLowerCase().trim()),
  );
  return skillsB.some((skill) =>
    normalizedA.has(String(skill).toLowerCase().trim()),
  );
};

const isQueuePairCompatible = ({
  mePreference,
  peerPreference,
  meQueue,
  peerQueue,
}) => {
  if (!mePreference.allowInstantMatch || !peerPreference.allowInstantMatch)
    return false;

  const meGender = mePreference.genderIdentity;
  const peerGender = peerPreference.genderIdentity;

  if (!isGenderAllowed(mePreference, peerGender)) return false;
  if (!isGenderAllowed(peerPreference, meGender)) return false;

  if (meQueue.preferredLanguage && peerQueue.preferredLanguage) {
    const meLang = String(meQueue.preferredLanguage).toLowerCase();
    const peerLang = String(peerQueue.preferredLanguage).toLowerCase();
    if (meLang !== peerLang) return false;
  }

  if (
    !hasSkillOverlap(meQueue.targetSkills || [], peerQueue.targetSkills || [])
  )
    return false;

  return true;
};

const getPreferences = asyncHandler(async (req, res) => {
  const preference = await getOrCreatePreference(req.user._id);
  return res.status(200).json({ success: true, preference });
});

const listDiscoverUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user._id },
    status: "active",
  })
    .select("firstName lastName email avatar role createdAt")
    .sort({ createdAt: -1 })
    .limit(200);

  const userIds = users.map((user) => user._id);
  const [preferences, blocks] = await Promise.all([
    PeerMatchPreference.find({ userId: { $in: userIds } }).select(
      "userId targetRole preferredLanguage targetSkills isPeerMatchingEnabled allowDirectInvites",
    ),
    PeerUserBlock.find({
      $or: [
        { userId: req.user._id, blockedUserId: { $in: userIds } },
        { userId: { $in: userIds }, blockedUserId: req.user._id },
      ],
    }).select("userId blockedUserId"),
  ]);

  const preferenceByUserId = new Map(
    preferences.map((preference) => [String(preference.userId), preference]),
  );

  const blockedUserIds = new Set();
  for (const block of blocks) {
    blockedUserIds.add(String(block.userId));
    blockedUserIds.add(String(block.blockedUserId));
  }

  const discoverUsers = users.map((user) => {
    const preference = preferenceByUserId.get(String(user._id));
    const isBlocked = blockedUserIds.has(String(user._id));

    return {
      _id: user._id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      avatar: user.avatar || "",
      role: user.role || "user",
      targetRole: preference?.targetRole || "",
      preferredLanguage: preference?.preferredLanguage || "English",
      targetSkills: Array.isArray(preference?.targetSkills)
        ? preference.targetSkills
        : [],
      isPeerMatchingEnabled: Boolean(preference?.isPeerMatchingEnabled),
      allowDirectInvites: Boolean(preference?.allowDirectInvites),
      isBlocked,
    };
  });

  return res.status(200).json({ success: true, users: discoverUsers });
});

const upsertPreferences = asyncHandler(async (req, res) => {
  const allowedFields = [
    "isPeerMatchingEnabled",
    "allowDirectInvites",
    "allowInstantMatch",
    "genderIdentity",
    "preferredMatch",
    "targetRole",
    "targetSkills",
    "preferredLanguage",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  const preference = await PeerMatchPreference.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updates },
    { returnDocument: "after", upsert: true, runValidators: true },
  );

  return res.status(200).json({ success: true, preference });
});

const sendRequest = asyncHandler(async (req, res) => {
  const {
    recipientUserId,
    message = "",
    mode = "direct",
    audioOnly = false,
    scheduledFor = null,
  } = req.body;

  if (!recipientUserId) {
    throw new ApiError(400, "recipientUserId is required");
  }

  if (String(recipientUserId) === String(req.user._id)) {
    throw new ApiError(400, "You cannot send request to yourself");
  }

  if (mode !== "direct") {
    throw new ApiError(400, "Only direct mode is available in this release");
  }

  const recipient = await User.findById(recipientUserId);
  if (!recipient || recipient.status !== "active") {
    throw new ApiError(404, "Recipient not found");
  }

  const blocked = await areUsersBlocked(req.user._id, recipient._id);
  if (blocked) {
    throw new ApiError(403, "Request blocked due to safety preferences");
  }

  const [senderPreference, recipientPreference] = await Promise.all([
    getOrCreatePreference(req.user._id),
    getOrCreatePreference(recipient._id),
  ]);

  if (!senderPreference.isPeerMatchingEnabled) {
    throw new ApiError(400, "Enable peer matching in preferences first");
  }

  if (
    !recipientPreference.isPeerMatchingEnabled ||
    !recipientPreference.allowDirectInvites
  ) {
    throw new ApiError(403, "Recipient is not accepting direct requests");
  }

  const senderGender = senderPreference.genderIdentity;
  const recipientGender = recipientPreference.genderIdentity;

  if (!isGenderAllowed(recipientPreference, senderGender)) {
    throw new ApiError(
      403,
      "Recipient match preference does not allow this request",
    );
  }

  if (!isGenderAllowed(senderPreference, recipientGender)) {
    throw new ApiError(
      400,
      "Your match preference does not allow this recipient",
    );
  }

  const existingPending = await PeerInterviewRequest.findOne({
    requesterId: req.user._id,
    recipientId: recipient._id,
    status: { $in: ["pending", "accepted_waiting_sender"] },
    expiresAt: { $gt: new Date() },
  });

  if (existingPending) {
    throw new ApiError(409, "A pending request already exists for this user");
  }

  const request = await PeerInterviewRequest.create({
    requesterId: req.user._id,
    recipientId: recipient._id,
    mode,
    message,
    metadata: {
      audioOnly: Boolean(audioOnly),
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    },
  });

  return res.status(201).json({ success: true, request });
});

const listRequests = asyncHandler(async (req, res) => {
  const status = req.query.status || "pending";
  const now = new Date();

  await PeerInterviewRequest.updateMany(
    {
      status: "pending",
      expiresAt: { $lt: now },
    },
    { $set: { status: "expired" } },
  );

  const visibleStatuses =
    status === "all"
      ? ["pending", "accepted_waiting_sender", "accepted"]
      : ["pending", "accepted_waiting_sender", "accepted"];

  const [incoming, outgoing] = await Promise.all([
    PeerInterviewRequest.find({
      recipientId: req.user._id,
      status: { $in: visibleStatuses },
    })
      .populate("requesterId", "firstName lastName email avatar")
      .populate("sessionId", "roomName status startedAt endedAt")
      .sort({ createdAt: -1 }),
    PeerInterviewRequest.find({
      requesterId: req.user._id,
      status: { $in: visibleStatuses },
    })
      .populate("recipientId", "firstName lastName email avatar")
      .populate("sessionId", "roomName status startedAt endedAt")
      .sort({ createdAt: -1 }),
  ]);

  return res.status(200).json({ success: true, incoming, outgoing });
});

const respondToRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body;

  if (!["accept", "reject"].includes(action)) {
    throw new ApiError(400, "action must be accept or reject");
  }

  const request = await PeerInterviewRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Request not found");

  if (String(request.recipientId) !== String(req.user._id)) {
    throw new ApiError(
      403,
      "You can only respond to your own incoming requests",
    );
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Request is no longer pending");
  }

  if (request.expiresAt < new Date()) {
    request.status = "expired";
    await request.save();
    throw new ApiError(400, "Request has expired");
  }

  if (action === "reject") {
    request.status = "rejected";
    await request.save();
    return res.status(200).json({ success: true, request });
  }

  request.status = "accepted_waiting_sender";
  await request.save();

  return res.status(200).json({
    success: true,
    request,
    message: "Request accepted. Waiting for sender to start the interview.",
  });
});

const joinAcceptedRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request =
    await PeerInterviewRequest.findById(requestId).populate("sessionId");

  if (!request) throw new ApiError(404, "Request not found");

  if (String(request.requesterId) !== String(req.user._id)) {
    throw new ApiError(403, "Only the sender can start this interview");
  }

  if (!["accepted_waiting_sender", "accepted"].includes(request.status)) {
    throw new ApiError(400, "This request is not ready to join");
  }

  if (request.sessionId) {
    const existingSession = await PeerInterviewSession.findById(
      request.sessionId._id,
    );

    if (!existingSession) {
      throw new ApiError(404, "Session not found");
    }

    return res.status(200).json({
      success: true,
      request,
      session: existingSession,
    });
  }

  const session = await PeerInterviewSession.create({
    participants: [request.requesterId, request.recipientId],
    mode: request.mode,
    roomName: `peer-${uuidv4()}`,
    requestId: request._id,
    scheduledFor: request.metadata?.scheduledFor || null,
    metadata: {
      audioOnly: Boolean(request.metadata?.audioOnly),
    },
  });

  request.status = "accepted";
  request.sessionId = session._id;
  await request.save();

  return res.status(201).json({ success: true, request, session });
});

const getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await PeerInterviewSession.findById(sessionId).populate(
    "participants",
    "firstName lastName email avatar",
  );

  if (!session) throw new ApiError(404, "Session not found");

  const isParticipant = session.participants.some(
    (participant) => String(participant._id) === String(req.user._id),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You do not have access to this session");
  }

  return res.status(200).json({ success: true, session });
});

const getLiveKitToken = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const livekitUrl = process.env.LIVEKIT_URL;
  const livekitApiKey = process.env.LIVEKIT_API_KEY;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

  if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
    throw new ApiError(500, "LiveKit credentials are not configured");
  }

  const session = await PeerInterviewSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Session not found");

  const isParticipant = session.participants.some(
    (participantId) => String(participantId) === String(req.user._id),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You do not have access to this room");
  }

  if (session.status === "cancelled" || session.status === "ended") {
    throw new ApiError(400, "Session is not active");
  }

  const token = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: String(req.user._id),
    name:
      [req.user.firstName, req.user.lastName].filter(Boolean).join(" ") ||
      req.user.email,
    ttl: process.env.LIVEKIT_TOKEN_TTL || "10m",
    metadata: JSON.stringify({
      userId: String(req.user._id),
      sessionId: String(session._id),
      audioOnly: Boolean(session.metadata?.audioOnly),
    }),
  });

  token.addGrant({
    roomJoin: true,
    room: session.roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const jwt = await token.toJwt();

  return res.status(200).json({
    success: true,
    token: jwt,
    livekitUrl,
    roomName: session.roomName,
    session,
  });
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason = "" } = req.body;

  if (String(userId) === String(req.user._id)) {
    throw new ApiError(400, "You cannot block yourself");
  }

  const target = await User.findById(userId);
  if (!target) throw new ApiError(404, "Target user not found");

  await PeerUserBlock.findOneAndUpdate(
    { userId: req.user._id, blockedUserId: userId },
    { $set: { reason } },
    { upsert: true, returnDocument: "after" },
  );

  await PeerInterviewRequest.updateMany(
    {
      status: "pending",
      $or: [
        { requesterId: req.user._id, recipientId: userId },
        { requesterId: userId, recipientId: req.user._id },
      ],
    },
    { $set: { status: "cancelled" } },
  );

  return res
    .status(200)
    .json({ success: true, message: "User blocked successfully" });
});

const reportUser = asyncHandler(async (req, res) => {
  const {
    reportedUserId,
    sessionId = null,
    reason,
    description = "",
  } = req.body;

  if (!reportedUserId || !reason) {
    throw new ApiError(400, "reportedUserId and reason are required");
  }

  if (String(reportedUserId) === String(req.user._id)) {
    throw new ApiError(400, "You cannot report yourself");
  }

  const target = await User.findById(reportedUserId);
  if (!target) throw new ApiError(404, "Reported user not found");

  const report = await PeerUserReport.create({
    reporterId: req.user._id,
    reportedUserId,
    sessionId,
    reason,
    description,
  });

  return res.status(201).json({ success: true, report });
});

const joinInstantQueue = asyncHandler(async (req, res) => {
  const {
    audioOnly = false,
    targetRole = "",
    targetSkills = [],
    preferredLanguage = "English",
  } = req.body;

  const myPreference = await getOrCreatePreference(req.user._id);
  if (!myPreference.isPeerMatchingEnabled || !myPreference.allowInstantMatch) {
    throw new ApiError(400, "Enable instant matching in preferences first");
  }

  const myQueue = await PeerMatchQueueEntry.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        status: "waiting",
        audioOnly: Boolean(audioOnly),
        targetRole,
        targetSkills: Array.isArray(targetSkills) ? targetSkills : [],
        preferredLanguage,
        matchedSessionId: null,
        matchedAt: null,
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  );

  const candidates = await PeerMatchQueueEntry.find({
    status: "waiting",
    userId: { $ne: req.user._id },
  })
    .sort({ updatedAt: 1 })
    .limit(30);

  for (const candidate of candidates) {
    const isBlocked = await areUsersBlocked(req.user._id, candidate.userId);
    if (isBlocked) continue;

    const candidatePreference = await getOrCreatePreference(candidate.userId);
    if (!candidatePreference.isPeerMatchingEnabled) continue;

    const compatible = isQueuePairCompatible({
      mePreference: myPreference,
      peerPreference: candidatePreference,
      meQueue: myQueue,
      peerQueue: candidate,
    });

    if (!compatible) continue;

    const session = await PeerInterviewSession.create({
      participants: [req.user._id, candidate.userId],
      mode: "instant",
      roomName: `peer-${uuidv4()}`,
      metadata: {
        audioOnly: Boolean(myQueue.audioOnly || candidate.audioOnly),
      },
    });

    await Promise.all([
      PeerMatchQueueEntry.updateOne(
        { _id: myQueue._id },
        {
          $set: {
            status: "matched",
            matchedSessionId: session._id,
            matchedAt: new Date(),
          },
        },
      ),
      PeerMatchQueueEntry.updateOne(
        { _id: candidate._id },
        {
          $set: {
            status: "matched",
            matchedSessionId: session._id,
            matchedAt: new Date(),
          },
        },
      ),
    ]);

    return res.status(200).json({ success: true, matched: true, session });
  }

  return res
    .status(200)
    .json({ success: true, matched: false, queueEntry: myQueue });
});

const leaveInstantQueue = asyncHandler(async (req, res) => {
  const queueEntry = await PeerMatchQueueEntry.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        status: "cancelled",
        matchedSessionId: null,
        matchedAt: null,
      },
    },
    { returnDocument: "after" },
  );

  return res.status(200).json({ success: true, queueEntry });
});

const getQueueStatus = asyncHandler(async (req, res) => {
  const queueEntry = await PeerMatchQueueEntry.findOne({
    userId: req.user._id,
  }).populate("matchedSessionId");

  return res.status(200).json({ success: true, queueEntry });
});

const startSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await PeerInterviewSession.findById(sessionId);

  if (!session) throw new ApiError(404, "Session not found");

  const isParticipant = session.participants.some(
    (participantId) => String(participantId) === String(req.user._id),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You do not have access to this session");
  }

  if (session.status === "ended" || session.status === "cancelled") {
    throw new ApiError(400, "Session is already closed");
  }

  if (session.status !== "in_progress") {
    session.status = "in_progress";
    session.startedAt = session.startedAt || new Date();
    await session.save();
  }

  return res.status(200).json({ success: true, session });
});

const endSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { notes = "" } = req.body;
  const session = await PeerInterviewSession.findById(sessionId);

  if (!session) throw new ApiError(404, "Session not found");

  const isParticipant = session.participants.some(
    (participantId) => String(participantId) === String(req.user._id),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You do not have access to this session");
  }

  if (session.status !== "ended") {
    session.status = "ended";
    session.endedAt = new Date();
    if (notes) {
      session.metadata.notes = notes;
    }
    await session.save();
  }

  await PeerMatchQueueEntry.updateMany(
    {
      userId: { $in: session.participants },
      matchedSessionId: session._id,
      status: "matched",
    },
    { $set: { status: "cancelled" } },
  );

  return res.status(200).json({ success: true, session });
});

const getAdminReports = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const filter = status ? { status } : {};

  const reports = await PeerUserReport.find(filter)
    .populate("reporterId", "firstName lastName email")
    .populate("reportedUserId", "firstName lastName email")
    .populate("sessionId", "roomName status createdAt")
    .populate("reviewedBy", "firstName lastName email")
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, reports });
});

const updateAdminReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, adminNote = "" } = req.body;

  if (
    !status ||
    !["open", "reviewing", "resolved", "dismissed"].includes(status)
  ) {
    throw new ApiError(400, "A valid status is required");
  }

  const report = await PeerUserReport.findById(reportId);
  if (!report) throw new ApiError(404, "Report not found");

  report.status = status;
  report.adminNote = adminNote;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  await report.save();

  return res.status(200).json({ success: true, report });
});

module.exports = {
  getPreferences,
  listDiscoverUsers,
  upsertPreferences,
  sendRequest,
  listRequests,
  respondToRequest,
  joinAcceptedRequest,
  getSession,
  getLiveKitToken,
  blockUser,
  reportUser,
  joinInstantQueue,
  leaveInstantQueue,
  getQueueStatus,
  startSession,
  endSession,
  getAdminReports,
  updateAdminReport,
};
