# NoteAI

NoteAI is a feature-rich note-taking application built with Next.js 18, Shadcn for UI components, and Groq for AI integration. It allows users to create, edit, and manage notes with the help of AI-powered features like generating, paraphrasing, summarizing, and elaborating on content.

## Key Features

- **Note Management**: Create, update, and delete notes.
- **AI Integration**: Use AI to generate, paraphrase, summarize, and elaborate on note content.
- **Rich Text Editing**: Format text using bold, italic, underline, lists, quotes, and links.
- **Responsive UI**: Sidebar for note navigation and main content area for editing and previewing notes.
- **Theme Toggle**: Switch between light and dark themes.
- **User Account Management**: Basic user account options like viewing account details and logging out.

## Technologies Used

- **Next.js 18**: React framework for server-side rendered (SSR) and static web applications.
- **Shadcn**: UI component library with pre-built, customizable components.
- **Groq**: Query language for JSON, often used with Sanity.io for querying content.
- **Framer Motion**: Library for animations.
- **React Markdown**: Library for rendering Markdown content in React.

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/noteai.git
    cd noteai
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Run the development server**:
    ```bash
    npm run dev
    ```

4. **Open the application**:
    Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Creating a Note**: Click the "New Note" button in the sidebar to create a new note.
2. **Editing a Note**: Select a note from the sidebar and start typing in the text editor. Use the toolbar to apply text formatting.
3. **Using AI**: Right-click in the text editor to open the AI context menu and select an AI action.
4. **Deleting a Note**: Click the delete button next to a note in the sidebar and confirm the deletion in the dialog.
5. **Saving a Note**: Click the save button in the toolbar and confirm the save in the dialog.
6. **Toggling Theme**: Click the theme toggle button in the toolbar to switch between light and dark themes.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the repository**.
2. **Create a new branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3. **Make your changes**.
4. **Commit your changes**:
    ```bash
    git commit -m 'Add some feature'
    ```
5. **Push to the branch**:
    ```bash
    git push origin feature/your-feature-name
    ```
6. **Open a pull request**.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.