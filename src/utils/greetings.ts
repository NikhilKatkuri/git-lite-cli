export default function Greet(user: string) {
  const professionalGreetings = [
    `Welcome, /m/user/m/. Ready to collaborate on your projects today?`,
    `Hello, /m/user/m/. Let's streamline your version control workflow.`,
    `Greetings, /m/user/m/. Your repository is set for success.`,
    `Welcome back, /m/user/m/. Prepared to advance your codebase?`,
    `Good day, /m/user/m/. Let's make impactful contributions today.`,
    `Hello, /m/user/m/. Time to manage your projects with precision.`,
    `Welcome, /m/user/m/. Your Git environment is ready for action.`,
    `Hi, /m/user/m/. Let's ensure seamless collaboration on your repositories.`,
    `Greetings, /m/user/m/. Ready to drive your development forward?`,
    `Good to see you, /m/user/m/. Let's optimize your Git workflow today.`,
  ];
  const rand = Math.floor(Math.random() * professionalGreetings.length);
  return professionalGreetings[rand]?.replace('/m/user/m/', user);
}
