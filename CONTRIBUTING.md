# Contributing to StreamIt Admin Panel

Thank you for your interest in contributing to the StreamIt Admin Panel! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit your changes: `git commit -m "Add: your feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## 📝 Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid using `any` - use `unknown` or proper types
- Use interfaces for object shapes
- Use type aliases for unions and primitives

### React

- Use functional components with hooks
- Prefer `const` over `let`
- Use arrow functions for components
- Keep components small and focused
- Extract reusable logic into custom hooks

### Naming Conventions

- **Files:** PascalCase for components (`UserCard.tsx`), camelCase for utilities (`formatDate.ts`)
- **Components:** PascalCase (`UserList`)
- **Functions:** camelCase (`getUserById`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types/Interfaces:** PascalCase (`UserProfile`)

### Backend

- Use async/await instead of callbacks
- Always handle errors appropriately
- Validate all input with Zod schemas
- Log important actions to AdminActivityLog
- Use transactions for multi-step database operations

### Frontend

- Use TanStack Query for data fetching
- Handle loading and error states
- Show toast notifications for user feedback
- Debounce search inputs
- Implement proper pagination

## 🧪 Testing

Before submitting a PR:

1. Test all affected features manually
2. Check for TypeScript errors: `bun run type-check`
3. Test on different screen sizes
4. Verify API endpoints work correctly
5. Check browser console for errors

## 📋 Pull Request Guidelines

### PR Title Format

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
- `feat: Add bulk user suspension`
- `fix: Correct pagination calculation in reports`
- `docs: Update API documentation for gifts endpoint`

### PR Description

Include:

1. **What**: Brief description of changes
2. **Why**: Reason for the changes
3. **How**: Implementation approach
4. **Testing**: How you tested the changes
5. **Screenshots**: For UI changes (before/after)

### Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tested on different screen sizes
- [ ] All endpoints return proper error responses

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear and concise description
2. **Steps to Reproduce**: Numbered steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, Node version, etc.
7. **Additional Context**: Any other relevant information

## 💡 Suggesting Enhancements

When suggesting features:

1. **Use Case**: Describe the problem or need
2. **Proposed Solution**: Your suggested approach
3. **Alternatives**: Other approaches considered
4. **Benefits**: How this helps users
5. **Mockups**: Visual representation if applicable

## 🔒 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the security team directly
3. Provide detailed information
4. Wait for acknowledgment before disclosing

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth](https://better-auth.com)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints
- Accept responsibility for mistakes

## 📞 Questions?

Feel free to:

- Open a discussion
- Ask in PR comments
- Reach out to maintainers

---

Happy coding! 🎉
