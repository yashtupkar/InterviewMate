const Question = require('../models/Question');

// @desc    Get all questions with filtering and pagination
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 15, 
      skill, 
      company, 
      domain, 
      difficulty, 
      type, 
      search,
      category
    } = req.query;

    const query = { isActive: true };

    if (skill) query.skills = { $in: skill.split(',').map(s => s.toLowerCase().trim()) };
    if (company) query.companies = { $in: company.split(',').map(c => c.toLowerCase().trim()) };
    if (domain) query.domains = { $in: domain.split(',').map(d => d.toLowerCase().trim()) };
    if (difficulty) query.difficulty = difficulty.toLowerCase().trim();
    if (type) query.type = type.toLowerCase().trim();
    if (category) query.category = category.toLowerCase().trim();
    
    // Basic text search on title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const pageConfig = parseInt(page);
    const limitConfig = parseInt(limit);
    const skip = (pageConfig - 1) * limitConfig;

    const questions = await Question.find(query)
      .select('title type difficulty skills companies domains') // Don't fetch full answer for list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitConfig);

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limitConfig),
      currentPage: pageConfig,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get unique filters available (companies, skills, domains) for UI dropdowns
// @route   GET /api/questions/filters/metadata
// @access  Public
exports.getFiltersMetadata = async (req, res) => {
  try {
    const [companies, skills, domains] = await Promise.all([
      Question.distinct('companies', { isActive: true }),
      Question.distinct('skills', { isActive: true }),
      Question.distinct('domains', { isActive: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        companies: companies.filter(Boolean).sort(),
        skills: skills.filter(Boolean).sort(),
        domains: domains.filter(Boolean).sort()
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get aggregated list of skills and companies with their question counts
// @route   GET /api/questions/stats/aggregates
// @access  Public
exports.getAggregatedStats = async (req, res) => {
  try {
    const defaultQuery = { isActive: true };

    const [skillsAgg, companiesAgg, behavioralAgg] = await Promise.all([
      Question.aggregate([
        { $match: defaultQuery },
        { $unwind: "$skills" },
        { 
          $group: {
            _id: "$skills",
            totalQuestions: { $sum: 1 },
            codingQuestions: {
              $sum: { $cond: [{ $eq: ["$type", "coding"] }, 1, 0] }
            },
            domains: { $addToSet: { $arrayElemAt: ["$domains", 0] } }
          }
        },
        { $sort: { "totalQuestions": -1 } }
      ]),
      Question.aggregate([
        { $match: defaultQuery },
        { $unwind: "$companies" },
        {
          $group: {
            _id: "$companies",
            totalQuestions: { $sum: 1 },
            codingQuestions: {
              $sum: { $cond: [{ $eq: ["$type", "coding"] }, 1, 0] }
            }
          }
        },
        { $sort: { totalQuestions: -1 } }
      ]),
      Question.aggregate([
        { $match: { ...defaultQuery, domains: "behavioral" } },
        { 
          $group: {
            _id: "$category",
            totalQuestions: { $sum: 1 }
          }
        },
        { $sort: { totalQuestions: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        skills: skillsAgg.map(s => ({
          name: s._id,
          domain: (s.domains || []).filter(Boolean)[0] || null,
          totalQuestions: s.totalQuestions,
          codingQuestions: s.codingQuestions
        })),
        companies: companiesAgg.map(c => ({
          name: c._id,
          totalQuestions: c.totalQuestions,
          codingQuestions: c.codingQuestions
        })),
        behavioral: behavioralAgg.filter(b => b._id).map(b => ({
          name: b._id,
          totalQuestions: b.totalQuestions
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching aggregated stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// @desc    Bulk upload/update questions
// @route   POST /api/questions/admin/bulk-upload
// @access  Admin
exports.bulkUploadQuestions = async (req, res) => {
  try {
    const questions = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Invalid format: Expected an array of questions' });
    }

    const operations = questions.map(q => ({
      updateOne: {
        filter: { title: q.title },
        update: { $set: { ...q, isActive: true } },
        upsert: true
      }
    }));

    const result = await Question.bulkWrite(operations);

    res.status(200).json({
      success: true,
      message: `${result.upsertedCount + result.modifiedCount} questions processed successfully`,
      data: {
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    console.error('Error bulk uploading questions:', error);
    res.status(500).json({ success: false, message: 'Server Error during bulk upload' });
  }
};
