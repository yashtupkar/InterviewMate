// export const interviewAgents = [
//   {
//     name: "Sophia",
//     provider: "openai",
//     voiceId: "nova",
//     bg: "ec4899",
//     image: "/assets/interviewers/female1.png",
//     animations: {
//       idle: "/assets/interviewers/animations/sophia/idle.mp4",
//       speaking: "/assets/interviewers/animations/sophia/speaking.mp4",
//       thinking: "/assets/interviewers/animations/sophia/idle.mp4",
//       listening: "/assets/interviewers/animations/sophia/idle.mp4",
//     },
//     label: "Female",
//     browserVoiceConfig: {
//       gender: "female",
//       pitch: 1.15,
//       rate: 1.0,
//       keywords: [
//         "Google US English",
//         "Microsoft Aria",
//         "Samantha",
//         "Siri",
//         "Female",
//       ],
//     },
//   },
//   {
//     name: "Rohan",
//     provider: "openai",
//     voiceId: "echo",
//     bg: "6366f1",
//     image: "/assets/interviewers/male1.png",
//     animations: {
//       idle: "/assets/interviewers/animations/rohan/idle.mp4",
//       speaking: "/assets/interviewers/animations/rohan/speaking.mp4",
//       thinking: "/assets/interviewers/animations/rohan/thinking.mp4",
//       listening: "/assets/interviewers/animations/rohan/listening.mp4",
//     },
//     label: "Male",
//     browserVoiceConfig: {
//       gender: "male",
//       pitch: 1.0,
//       rate: 0.95,
//       keywords: [
//         "Google UK English Male",
//         "Microsoft Guy",
//         "Daniel",
//         "Alex",
//         "Male",
//       ],
//     },
//   },

//   {
//     name: "Marcus",
//     provider: "openai",
//     voiceId: "onyx",
//     bg: "10b981",
//     image: "/assets/interviewers/male2.png",
//     animations: {
//       idle: "/assets/interviewers/animations/marcus/idle.mp4",
//       speaking: "/assets/interviewers/animations/marcus/speaking.mp4",
//       thinking: "/assets/interviewers/animations/marcus/thinking.mp4",
//       listening: "/assets/interviewers/animations/marcus/listening.mp4",
//     },
//     label: "Male",
//     browserVoiceConfig: {
//       gender: "male",
//       pitch: 1.3,
//       rate: 1.0,
//       keywords: [
//         "Google UK English Male",
//         "Microsoft Ryan",
//         "Alex",
//         "Christopher",
//         "Male",
//       ],
//     },
//   },
//   {
//     name: "Emma",
//     provider: "openai",
//     voiceId: "shimmer",
//     bg: "8b5cf6",
//     image: "/assets/interviewers/female2.png",
//     animations: {
//       idle: "/assets/interviewers/animations/emma/idle.mp4",
//       speaking: "/assets/interviewers/animations/emma/speaking.mp4",
//       thinking: "/assets/interviewers/animations/emma/thinking.mp4",
//       listening: "/assets/interviewers/animations/emma/listening.mp4",
//     },
//     label: "Female",
//     browserVoiceConfig: {
//       gender: "female",
//       pitch: 1.0,
//       rate: 1.0,
//       keywords: [
//         "Google UK English Female",
//         "Microsoft Mia",
//         "Victoria",
//         "Siri",
//         "Female",
//       ],
//     },
//   },
//   {
//     name: "Elliot",
//     provider: "vapi",
//     voiceId: "Elliot",
//     bg: "f59e0b",
//     image: "/assets/interviewers/male3.png",
//     label: "Male",
//   },
//   {
//     name: "Rachel",
//     provider: "11labs",
//     voiceId: "21m00Tcm4TlvDq8ikWAM",
//     bg: "E11D48",
//     image: "/assets/interviewers/female3.png",
//     label: "Female",
//     browserVoiceConfig: {
//       gender: "female",
//       pitch: 1.4,
//       rate: 1.0,
//       keywords: [
//         "Google UK English Female",
//         "Microsoft Susan",
//         "Zira",
//         "Siri",
//         "Female",
//       ],
//     },
//   },
//   {
//     name: "Drew",
//     provider: "11labs",
//     voiceId: "29vD33N1CtxCmqQRPOHJ",
//     bg: "2563EB",
//     image: "/assets/interviewers/male4.png",
//     label: "Male",
//     browserVoiceConfig: {
//       gender: "male",
//       pitch: 0.8,
//       rate: 1.0,
//       keywords: [
//         "Google UK English Male",
//         "Microsoft David",
//         "Mark",
//         "Christopher",
//         "Male",
//       ],
//     },
//   },
//   {
//     name: "Clyde",
//     provider: "11labs",
//     voiceId: "2EiwWnXFnvU5JabPnv8n",
//     bg: "D97706",
//     image: "/assets/interviewers/male5.png",
//     label: "Male",
//   },
//   {
//     name: "Mimi",
//     provider: "11labs",
//     voiceId: "zrHiDhphv9ZnVXBqCLjz",
//     bg: "EC4899",
//     image: "/assets/interviewers/female4.png",
//     label: "Female",
//   },
//   {
//     name: "Fin",
//     provider: "11labs",
//     voiceId: "D38z5RcWu1voky8WS1ja",
//     bg: "059669",
//     image: "/assets/interviewers/male6.png",
//     label: "Male",
//   },
//   {
//     name: "Nicole",
//     provider: "11labs",
//     voiceId: "piTKgcLEGmPE4e6mEKli",
//     bg: "7C3AED",
//     image: "/assets/interviewers/female5.png",
//     label: "Female",
//   },
// ];


/**
 * interviewAgents
 *
 * animations keys:
 *   idle     → plays when agent is idle, thinking, or listening   (canonical: "idle")
 *   speaking → plays when agent is speaking                        (canonical: "speaking")
 *
 * Values can be:
 *   • a single string  "/path/clip.mp4"
 *   • an array         ["/path/clip1.mp4", "/path/clip2.mp4"]
 *     → one is picked at random each time the state is entered,
 *       avoiding the previously played clip where possible.
 *
 * The old keys "thinking" and "listening" are still read for backward
 * compatibility but are merged into the idle pool automatically.
 */
export const interviewAgents = [
  {
    name: "Sophia",
    provider: "openai",
    voiceId: "nova",
    bg: "ec4899",
    profileImage: "/assets/interviewers/profileImg/female.png",
    image: "/assets/interviewers/female-new2.png",
    animations: {
      // Multiple idle clips → picked randomly
      idle: [
        "/assets/interviewers/animations/sophia/idle.mp4",
        "/assets/interviewers/animations/sophia/idle2.mp4", // add more as needed
      ],
      speaking: [
        "/assets/interviewers/animations/sophia/speaking.mp4",
        "/assets/interviewers/animations/sophia/speaking2.mp4",
        "/assets/interviewers/animations/sophia/speaking3.mp4",
        "/assets/interviewers/animations/sophia/speaking4.mp4",
      ],
    },
    label: "Female",
    browserVoiceConfig: {
      gender: "female",
      pitch: 1.15,
      rate: 1.0,
      keywords: [
        "Google US English",
        "Microsoft Aria",
        "Samantha",
        "Siri",
        "Female",
      ],
    },
  },
  {
    name: "Rohan",
    provider: "openai",
    voiceId: "echo",
    bg: "6366f1",
    profileImage: "/assets/interviewers/profileImg/male1.png",
    image: "/assets/interviewers/male-new.png",
    animations: {
      idle: [
        "/assets/interviewers/animations/rohan/idle.mp4",
        "/assets/interviewers/animations/rohan/idle2.mp4",
      ],
      speaking: [
        "/assets/interviewers/animations/rohan/speaking2.mp4",
        "/assets/interviewers/animations/rohan/speaking3.mp4",
      ],
    },
    label: "Male",
    browserVoiceConfig: {
      gender: "male",
      pitch: 1.0,
      rate: 0.95,
      keywords: [
        "Google UK English Male",
        "Microsoft Guy",
        "Daniel",
        "Alex",
        "Male",
      ],
    },
  },
  {
    name: "Marcus",
    provider: "openai",
    voiceId: "onyx",
    bg: "10b981",
    profileImage: "/assets/interviewers/profileImg/male2.png",
    image: "/assets/interviewers/male-new2.png",
    animations: {
      idle: [
        "/assets/interviewers/animations/marcus/idle.mp4",
        "/assets/interviewers/animations/marcus/thinking.mp4",
        "/assets/interviewers/animations/marcus/listening.mp4",
      ],
      speaking: "/assets/interviewers/animations/marcus/speaking.mp4",
    },
    label: "Male",
    browserVoiceConfig: {
      gender: "male",
      pitch: 1.3,
      rate: 1.0,
      keywords: [
        "Google UK English Male",
        "Microsoft Ryan",
        "Alex",
        "Christopher",
        "Male",
      ],
    },
  },
  {
    name: "Emma",
    provider: "openai",
    voiceId: "shimmer",
    bg: "8b5cf6",
    profileImage: "/assets/interviewers/profileImg/female1.png",
    image: "/assets/interviewers/female-new2.png",
    animations: {
      idle: [
        "/assets/interviewers/animations/emma/idle.mp4",
        "/assets/interviewers/animations/emma/thinking.mp4",
        "/assets/interviewers/animations/emma/listening.mp4",
      ],
      speaking: "/assets/interviewers/animations/emma/speaking.mp4",
    },
    label: "Female",
    browserVoiceConfig: {
      gender: "female",
      pitch: 1.0,
      rate: 1.0,
      keywords: [
        "Google UK English Female",
        "Microsoft Mia",
        "Victoria",
        "Siri",
        "Female",
      ],
    },
  },
  // {
  //   name: "Elliot",
  //   provider: "vapi",
  //   voiceId: "Elliot",
  //   bg: "f59e0b",
  //   image: "/assets/interviewers/male3.png",
  //   label: "Male",
  //   // No animations → falls back to static image
  // },
  // {
  //   name: "Rachel",
  //   provider: "11labs",
  //   voiceId: "21m00Tcm4TlvDq8ikWAM",
  //   bg: "E11D48",
  //   image: "/assets/interviewers/female3.png",
  //   label: "Female",
  //   browserVoiceConfig: {
  //     gender: "female",
  //     pitch: 1.4,
  //     rate: 1.0,
  //     keywords: [
  //       "Google UK English Female",
  //       "Microsoft Susan",
  //       "Zira",
  //       "Siri",
  //       "Female",
  //     ],
  //   },
  // },
  // {
  //   name: "Drew",
  //   provider: "11labs",
  //   voiceId: "29vD33N1CtxCmqQRPOHJ",
  //   bg: "2563EB",
  //   image: "/assets/interviewers/male4.png",
  //   label: "Male",
  //   browserVoiceConfig: {
  //     gender: "male",
  //     pitch: 0.8,
  //     rate: 1.0,
  //     keywords: [
  //       "Google UK English Male",
  //       "Microsoft David",
  //       "Mark",
  //       "Christopher",
  //       "Male",
  //     ],
  //   },
  // },
  // {
  //   name: "Clyde",
  //   provider: "11labs",
  //   voiceId: "2EiwWnXFnvU5JabPnv8n",
  //   bg: "D97706",
  //   image: "/assets/interviewers/male5.png",
  //   label: "Male",
  // },
  // {
  //   name: "Mimi",
  //   provider: "11labs",
  //   voiceId: "zrHiDhphv9ZnVXBqCLjz",
  //   bg: "EC4899",
  //   image: "/assets/interviewers/female4.png",
  //   label: "Female",
  // },
  // {
  //   name: "Fin",
  //   provider: "11labs",
  //   voiceId: "D38z5RcWu1voky8WS1ja",
  //   bg: "059669",
  //   image: "/assets/interviewers/male6.png",
  //   label: "Male",
  // },
  // {
  //   name: "Nicole",
  //   provider: "11labs",
  //   voiceId: "piTKgcLEGmPE4e6mEKli",
  //   bg: "7C3AED",
  //   image: "/assets/interviewers/female5.png",
  //   label: "Female",
  // },
];