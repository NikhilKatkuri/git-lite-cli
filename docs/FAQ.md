# Frequently Asked Questions (FAQ)

## 🤔 General Questions

### Q: What exactly is git-lite-cli?

**A:** It's a friendly, interactive command-line tool that makes Git and GitHub operations simple. Instead of memorizing complex Git commands, you get point-and-click menus that handle everything for you.

### Q: Do I need to know Git to use this?

**A:** Absolutely not! That's the whole point. git-lite-cli is designed for people who want to use Git without learning all the commands first. It's perfect for beginners.

### Q: Will this replace my need to learn Git eventually?

**A:** git-lite-cli covers 80% of common Git operations that developers use daily. For advanced Git workflows, you might eventually want to learn command-line Git, but this tool will handle most of your needs.

### Q: Is it only for beginners?

**A:** Not at all! Many experienced developers use it because it's faster than typing commands for routine operations. It's about efficiency, not skill level.

## 🛠️ Technical Questions

### Q: What operating systems does it support?

**A:** Works on Windows, macOS, and Linux. Since it's built with Node.js, it runs anywhere Node.js runs.

### Q: Do I need to install Git separately?

**A:** Yes, you need Git installed on your system. git-lite-cli uses your existing Git installation but provides a friendlier interface.

### Q: Is my GitHub token secure?

**A:** Yes, your token is stored locally on your machine only. It's never sent to any servers except GitHub's official API for authentication.

### Q: Can I use it with private repositories?

**A:** Absolutely! You can create both public and private repositories, and work with existing private repos you have access to.

### Q: Does it work with GitHub Enterprise?

**A:** Currently designed for GitHub.com. GitHub Enterprise support could be added in future versions.

## 🚀 Usage Questions

### Q: Can I use this for team projects?

**A:** Yes! Multiple team members can use git-lite-cli on the same repository. It works great for standardizing workflows across team members with different Git skill levels.

### Q: What if I make a mistake?

**A:** git-lite-cli includes safeguards and confirmations for destructive operations. Plus, since everything goes through Git, you have full Git history for recovery.

### Q: Can I mix git-lite-cli with regular Git commands?

**A:** Absolutely! You can use both interchangeably. git-lite-cli just provides a friendlier interface to the same Git operations.

### Q: Does it support all Git features?

**A:** It covers the most commonly used features:

- ✅ Repository creation
- ✅ Pushing/pulling code
- ✅ Branch management
- ✅ Basic commit operations
- ❌ Advanced Git features (rebasing, cherry-picking, etc.)
- ❌ Git hooks
- ❌ Submodules

## 🎓 Learning Questions

### Q: Will using this help me learn Git?

**A:** Yes! By seeing the results of operations and understanding the workflow, you'll naturally learn Git concepts. Many users transition to command-line Git more confidently after using git-lite-cli.

### Q: Should I teach my students to use this?

**A:** Many educators use git-lite-cli to introduce Git concepts without overwhelming students with syntax. It's great for focusing on understanding workflows before diving into commands.

## 🔧 Troubleshooting

### Q: It's asking for a GitHub token - what do I do?

**A:**

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "git-lite-cli"
4. Select scopes: `repo` and `user`
5. Copy the token and paste it when prompted

### Q: I get permission errors when pushing

**A:** Check that:

- Your GitHub token has the right permissions (`repo` scope)
- You have write access to the repository
- The repository exists and you're the owner/collaborator

### Q: The tool seems stuck or frozen

**A:** Try pressing Ctrl+C to cancel and restart. The tool has graceful cancellation handling.

### Q: I can't find my repository after creating it

**A:** Check your GitHub profile. New repositories appear immediately. Make sure you're logged into the correct GitHub account.

## 💡 Best Practices

### Q: When should I use git-lite-cli vs regular Git?

**A:** Use git-lite-cli for:

- Daily operations (push, pull, create repos)
- When you want speed and simplicity
- Teaching/learning scenarios
- Team standardization

Use regular Git for:

- Advanced operations (rebasing, complex merges)
- Scripting and automation
- When you need specific Git flags/options

### Q: Any tips for teams adopting this?

**A:**

- Start with new team members
- Use for common operations but teach command-line Git too
- Great for code reviews and daily standups
- Standardizes workflows across skill levels

## 🆘 Getting Help

### Q: Where can I get more help?

**A:**

- Run `git-lite-cli --help` for quick reference
- Check our [documentation](../README.md)
- Open an [issue on GitHub](https://github.com/NikhilKatkuri/git-lite-cli/issues)
- Look at [use cases and examples](USE_CASES.md)

### Q: How do I report bugs or request features?

**A:** Open an issue on our [GitHub repository](https://github.com/NikhilKatkuri/git-lite-cli/issues). We're always looking to improve!

### Q: Can I contribute to the project?

**A:** Absolutely! Check our [contributing guidelines](../CONTRIBUTING.md) and feel free to submit pull requests.

---

**Still have questions?** [Open an issue](https://github.com/NikhilKatkuri/git-lite-cli/issues) and we'll help you out! 🚀
