# SkillSwap

## Project Title & Description

SkillSwap is a dynamic web platform designed to foster a community of learning and growth through skill exchange. Users can register, showcase skills they are proficient in and eager to teach, and simultaneously list skills they wish to acquire. The platform facilitates seamless connections between users, enabling them to initiate, request, and accept skill exchange sessions. Whether you're looking to share your expertise or learn something new, SkillSwap provides an intuitive and engaging environment to connect with like-minded individuals and expand your horizons.

## Features

  * **User Registration & Authentication:** Secure sign-up and login functionality for new and existing users.
  * **User Dashboard:** Personalized dashboard displaying user's listed skills, requested sessions, and active skill exchanges.
  * **Skill Listing:** Users can easily add skills they can teach and skills they want to learn.
  * **Skill Marketplace:** A central hub to browse available skills offered by other users.
  * **Session Request & Management:** Users can send and receive skill exchange requests, and manage the status of their sessions.
  * **Dynamic Content Rendering:** Interactive user interface powered by JavaScript for a smooth user experience.
  * **Secure Session Storage:** Maintains user login state and session information securely.
  * **User Profile Editing:** Ability for users to update their profile information and skill listings.

## Tech Stack

**Backend:**

  * **Node.js:** JavaScript runtime environment for server-side logic.
  * **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
  * **MongoDB:** NoSQL database for storing user data, skills, and session requests.
  * **Mongoose:** ODM (Object Data Modeling) library for MongoDB and Node.js, providing a straightforward, schema-based solution to model application data.

**Frontend:**

  * **HTML:** Standard markup language for creating web pages.
  * **CSS:** Stylesheet language used for describing the presentation of a document written in HTML.
  * **JavaScript:** Programming language for dynamic and interactive web content.

## Setup Instructions

Follow these steps to get SkillSwap up and running on your local machine:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/SkillSwap.git
    cd SkillSwap
    ```

2.  **Install Backend Dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following:

    ```
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/skillswapdb
    SESSION_SECRET=your_super_secret_key_here
    ```

      * `PORT`: The port your server will run on (e.g., 3000).
      * `MONGODB_URI`: Your MongoDB connection string. If you have MongoDB installed locally, the default is `mongodb://localhost:27017/skillswapdb`.
      * `SESSION_SECRET`: A strong, random string used to sign the session ID cookie.

4.  **Start the MongoDB Server:**
    Ensure your MongoDB server is running. If you're using a local installation, you can typically start it using:

    ```bash
    mongod
    ```

5.  **Run the Backend Server:**

    ```bash
    npm start
    ```

    The server will start on the port specified in your `.env` file (e.g., `http://localhost:3000`).

6.  **Open in Browser:**
    Navigate to `http://localhost:3000` in your web browser to access the SkillSwap application.

## Folder Structure

```
SkillSwap/
├── models/                 # Mongoose models for database schemas
│   ├── Session.js          # Mongoose model for skill session requests
│   └── User.js             # Mongoose model for user data
├── node_modules/           # Installed Node.js dependencies
├── public/                 # Static frontend assets
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js         # Frontend JavaScript for authentication (login/register)
│   │   ├── dashboard.js    # Frontend JavaScript for dashboard functionality
│   │   ├── edit.js         # Frontend JavaScript for profile/skill editing
│   │   ├── extradashboard.js # Additional dashboard-related JavaScript
│   │   └── marketplace.js  # Frontend JavaScript for marketplace interactions
│   ├── peopleimg/          # Directory for user profile images or similar
│   ├── dashboard.html      # HTML file for the user dashboard
│   ├── edit-profile.html   # HTML file for editing user profiles
│   ├── icon.png            # Application icon
│   ├── logohmtl.png        # Logo image for HTML
│   ├── marketplace.html    # HTML file for the skill marketplace
│   └── register.html       # HTML file for user registration
├── routes/                 # Express routes for API endpoints
│   └── (Your route files will go here, e.g., auth.js, dashboard.js, etc.)
├── README.md               # Project README file
├── package-lock.json       # Records the exact versions of dependencies
├── package.js              # (Potentially a typo, usually package.json holds package info)
├── package.json            # Project metadata and dependencies
└── server.js               # Main server file (equivalent to app.js in some setups)
```

## Contributing

We welcome contributions to SkillSwap\! If you'd like to contribute, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/fix-something`.
3.  **Make your changes** and commit them with clear, concise messages.
4.  **Push your changes** to your forked repository.
5.  **Submit a pull request** to the `main` branch of the original repository, describing your changes in detail.

**Note on Marketplace:** The marketplace functionality is currently under active development. Your contributions to this section would be highly appreciated\! Feel free to reach out if you'd like to help.
