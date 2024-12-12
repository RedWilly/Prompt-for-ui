export const plans = [
  {
    name: "Free",
    description: "Perfect for trying out our service",
    price: "$0",
    features: [
      "5 prompts per month",
      "Basic support",
      "Standard response time",
      "Community access",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
  },
  {
    name: "PRO",
    description: "For professionals and teams",
    price: "$10",
    features: [
      "60 prompts per month",
      "Priority support",
      "Faster response time",
      "Advanced features",
      "Early access to updates",
    ],
    buttonText: "Subscribe",
    buttonVariant: "default" as const,
  },
];