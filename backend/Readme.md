# Movie Recommendation API Routes

❌ ✅

## Auth
- ✅ POST /api/auth/register         - Register new user
- ✅ POST /api/auth/login            - Register new user

## Users
- ✅ GET /api/users/profile          - Get user profile
- ✅ PUT /api/users/profile          - Update user profile
- ❌ POST /api/users/logout          - Logout user

## Movies
- ✅ GET /api/movies                 - List all movies
- ✅ GET /api/movies/:id/image             - Get image of a movie
- ✅ POST /api/movies                - Add new movie
- ❌ PUT /api/movies/:id             - Update movie
- ✅ DELETE /api/movies/:id          - Delete movie

## Favorites

- ✅ POST /api/favorites - Add movie to favorites
- ✅ DELETE /api/favorites/:movieId - Remove movie from favorites
- ✅ GET /api/favorites - Get user's favorite movies
- ✅ GET /api/favorites/count - Get count of favorite movies

## Movie Lists
- ✅ GET /api/lists/self                  - Get user's movie lists
- ✅ GET /api/lists/all                  - Get all the movie lists
- ✅ POST /api/lists                 - Create new list
- ✅ GET /api/lists/:id              - Get specific list
- ✅ PUT /api/lists/:id              - Update list
- ✅ DELETE /api/lists/:id           - Delete list
- ✅ POST /api/lists/:id/movies      - Add movie to list
- ✅ DELETE /api/lists/:id/movies/:movieId - Remove movie from list

## Likes
- ✅ POST /api/like/:id        - Toggle like on list
- ✅ GET /api/like/:id        - Get list status
- ✅ GET /api/like/:id/count  - Get like count
- ✅ GET /api/like/me/liked-lists        - Get list of all my liked-list except the private one

## Comments
- ❌ POST /api/lists/:id/comments    - Add comment
- ❌ GET /api/lists/:id/comments     - Get list comments
- ❌ PUT /api/lists/:id/comments/:commentId  - Edit comment
- ❌ DELETE /api/lists/:id/comments/:commentId - Delete comment

## Notifications
- ❌ GET /api/notifications          - Get user notifications
- ❌ PUT /api/notifications/:id      - Mark notification as read
- ❌ DELETE /api/notifications/:id   - Delete notification

## Push Subscriptions
- ✅ POST /api/push-subscriptions    - Subscribe to push notifications
- ❌ DELETE /api/push-subscriptions  - Unsubscribe from push notifications
