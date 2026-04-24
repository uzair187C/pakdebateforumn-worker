

export const DEFAULT_QUESTIONS = [
  {
    id: "name",
    label: "Full Name",
    type: "text",
    required: true
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    required: true
  },
  {
    id: "institution",
    label: "Institution / School",
    type: "text",
    required: true
  },
  {
    id: "experience",
    label: "Debating Experience",
    type: "select",
    required: true,
    options: ["Beginner", "Intermediate", "Advanced"]
  },
  {
    id: "comments",
    label: "Anything you'd like us to know?",
    type: "textarea",
    required: false
  }
];
