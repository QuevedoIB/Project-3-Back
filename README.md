# Timder

## Description

Timder is a social web application that groups people based on their personality and preferences over physique.

## User Stories

-  **404:** As an anon/user I can see a 404 page if I try to reach a page that does not exist so that I know it's my fault
-  **Signup:** As an anon I can sign up in the platform.
-  **Login:** As a user I can login to the platform.
-  **Logout:** As a user I can logout from the platform so no one else can use it.
-  **Stablish my preferences** As a user I can do a personality test and stablish my social preferences.
-  **List people** As a user I want to see a list of people that matches my preferences.
-  **Accept/decline matches** As a user I want to accept or decline matches so I can start talking with them.
-  **Chat** As a user I want to talk with the people I matched.
-  **Poll to show hide image** As a user I want be able to show hide my image with the people I matched.

## Backlog

- Matches by location
- Change my password
- Upload my profile picture
- See other users profile
- Redux state
- Notifications (socket)
- Voice to chat
- Premium / Buy features
- Images in chat
- Vote user system
- Google sign up
  
# Client

## Routes
| Method | Path | Component | Permissions | Behavior | 
|--------|------|--------|--| -------|
| `get`  | `/` | HomePageComponent| public | just promotional copy|
| `get`  | `/auth/signup` | SignupFormComponent| anon only | signup form, link to login, navigate to profile after signup|
| `get`  | `/auth/login` | LoginFormComponent| anon only | login form, link to signup, navigate to profile after login |
| `post` | `/auth/signup` | SignupFormComponent| anon only| signup form, link to login, navigate to profile after signup|
| `post` | `/auth/login` | LoginFormComponent | anon only |login form, link to signup, navigate to profile after login |
| `post` | `/auth/logout` | n/a| anon only | navigate to homepage after logout, expire session |
| `get`  | `/search-people` | PeopleListComponent| user only | shows people, match button, next/user, search by personality/location |
| `post` | `/match/:id` | PeopleListComponent | user only | matches a user from the list, redirects back to the list page |
| `put` | `/edit-profile/me` | ChangeProfileForm  | user only  | changes user preferences/password
| `delete` | `/delete/:id` | na | user only | delete match
| `get` | `/profile/me` | ProfilePageComponent | user only | my details |
| `get` | `/contacts` | MatchesListComponent | me only | my matches, links to match chat |
| `get` | `/chat/user` | MatchChatComponent | me only | chat, back to matches link |
| `post` | `/chat/user` | MatchChatComponent | me only | posts a message |
| `get` | `**` | NotFoundPageComponent | public | 




## Components

- SignUp Form
  - Output: username: unique
 	   password: any
	   email: unique
           image: any
           quote: any
           preferences: any
	   personality: any

- LogIn Form
  - Output: username: unique
 	   password: any


- Home 
  - Input: SignUp
	   LogIn

- Profile
  - Input: Search
           Matches
           Edit

- Edit Form 
  - Output: username: unique
 	    password: any
            image: any
            quote: any
            preferences: any

- People
   -Input: Next User
   - Output: Match

- User Card
 
- Contacts
   - Input: Profile
            Chat
   - Output: Delete contact

- Chat
   - Input: Profile
   - Output: Message


## Services

- Auth Service
  - auth.login(user)
  - auth.signup(user)
  - auth.logout()
  - auth.me()
  - auth.getUser() // synchronous
- User Service
  - user.list()
  - user.search(terms)
  - user.profile(id)
  - user.match(id)
  - user.removeMatch(id) 
- Chat Service
  - chat.getHistory()
  - chat.getUsers
  - chat.sendMessage()

# Server

## Models

User model

```
username - String // required & unique
email - String // required & unique
password - String // required
image - String // 
preferences - Array strings // required
quote - String 
personality - Object
```

Chat model

```
history - Array
users - Array

```

## API Endpoints (backend routes)

- GET /auth/me
  - 404 if no user in session
  - 200 with user object
- POST /auth/signup
  - 401 if user logged in
  - body:
    - username
    - email
    - password
    - image (not required)
    - quote
    - preferences
  - validation
    - fields not empty (422)
    - user not exists (409)
  - create user with encrypted password
  - store user in session
  - 200 with user object
- POST /auth/login
  - 401 if user logged in
  - body:
    - username
    - password
  - validation
    - fields not empty (422)
    - user exists (404)
    - passdword matches (404)
  - store user in session
  - 200 with user object
- POST /auth/logout
  - body: (empty)
  - 204
- POST /match/invite/
  - body:
    - userId
  - validation
    - id isn't valid (404)
  - add to accept/decline
  - updates user in session
- DELETE /user/me/contact/:id
  - validation
    - id is valid (404)
    - id exists (404)
  - body: (empty - the user is already stored in the session)
  - remove from contacts
  - updates user in session
- POST /message
  - body:
    - text
    - date?
  - validation
    - fields not empty
  - create message
  - 200 with chat history object
- GET /contact/:id
  - 404 if user doesn't exist
  - 200 with user object
- GET /chat/:id
  - 404 if user doesn't exist
  - 200 with user object


  

## Links

### Trello/Kanban

[Link to your trello board](https://trello.com) or picture of your physical board

### Git

The url to your repository and to your deployed project

[Client repository Link] https://github.com/QuevedoIB/Project-3-Back
[Server repository Link] https://github.com/QuevedoIB/Project-3-Front

[Deploy Link](http://heroku.com)

### Slides

The url to your presentation slides

[Slides Link](http://slides.com)
