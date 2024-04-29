
let loggedIn = false;
let userId;


window.addEventListener('DOMContentLoaded', async() => {
        await fetchAndDisplayBlogPosts();
});


/**
 * fetches blog posts from the server and displays on the webpage
 *
 * @returns {Promise} A promise that resolves when the blog posts are fetched and displayed
 */
async function fetchAndDisplayBlogPosts() {
    //implement
    try {
        const blogPostResponse = await fetch('/blogs/');
        if (!blogPostResponse.ok) {
            throw new Error('Failed to fetch blog posts');
        }
        const blogPosts = await blogPostResponse.json();

        await Promise.all(blogPosts.map(async (blogPost) => {

            const authorResponse = await fetch(`/users/getUserById/${blogPost.author}`);
            if (!authorResponse.ok) {
                throw new Error('Failed to fetch author details');
            }
            const authorData = await authorResponse.json();     //puts all the data into a json object
            blogPost.authorName = authorData.name;
        }));

        await Promise.all(blogPosts.map(async (blogPost) => {

            await Promise.all(blogPost.comments.map(async (comment) => {

                const userResponse = await fetch(`/users/getUserById/${comment.user}`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch author details');
                }

                const userData = await userResponse.json();     //puts all the data into a json object
                comment.userName = userData.name;
            }));
        }));

        await displayBlogPost(blogPosts);


    } catch (error) {
        console.error('Error fetching content', error.message);
    }

}

/**
 * Displays the given array of blog posts on the webpage
 *
 * @param {Array} blogPosts An array of blog post objects to be displayed
 * @returns {Promise} A promise that resolves when the blog posts are displayed
 */
async function displayBlogPost(blogPosts){
    const blogPostContainer = document.getElementById('blogPosts');
    blogPostContainer.innerHTML = '';   //resets the page so that all the posts can be grabbed again

    blogPosts.forEach(blogPost => {
        const cardElement = createBlogPostCard(blogPost);

        blogPostContainer.appendChild(cardElement);
    });
}

/**
 * Create a card element for a blog post
 *
 * @param {Object} blogPost The blog post object for which the card is created
 * @returns {HTMLElement} The HTML element representing the blog post card
 */
function createBlogPostCard(blogPost) {

    const cardElement = document.createElement('div');
    cardElement.classList.add('blog-post-card');

    const titleElement = document.createElement('h5');
    titleElement.textContent = blogPost.title;

    const authorElement = document.createElement('p');
    authorElement.textContent = `Author: ${blogPost.authorName}`;

    const contentElement = document.createElement('p');
    contentElement.textContent = blogPost.content;

    const postLikesButton = createLikeButton(blogPost.likes);

    postLikesButton.addEventListener('click', async () => {
        if (blogPost.liked || !loggedIn) {
            return;
        }
        try {
            const response = await fetch(`/blogs/like/${blogPost._id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'}
            });

            if (!response.ok) {
                throw new Error('Failed to like the blog post. Please try again.');
            }

            blogPost.likes++;
            postLikesButton.querySelector('.likes-count').textContent = `${blogPost.likes}`;
            blogPost.liked = true;
        } catch (error) {
            console.error('Error: ', error.message);
        }
    });

    const commentsElement = createCommentsElement(blogPost);
    cardElement.appendChild(titleElement);
    cardElement.appendChild(authorElement);
    cardElement.appendChild(postLikesButton);
    cardElement.appendChild(contentElement);
    cardElement.appendChild(commentsElement);

    if (loggedIn) {
        const commentForm = createCommentForm(blogPost._id);
        cardElement.appendChild(commentForm);
    }

    return cardElement;
}

/**
 * Creates a like button element with the specified number of likes
 *
 * @param {number} likes - the number of likes for the blog post or comment
 * @returns {HTMLElement} The HTML element representing the like button
 */
function createLikeButton (likes) {
    const likesButton = document.createElement('button');
    likesButton.classList.add('likes-button');

    const heartIcon = document.createElement('i');
    heartIcon.classList.add('heart-icon');
    heartIcon.innerHTML = '<i class="fa-solid fa-heart"></i>';
    heartIcon.classList.add('hearts');

    const likesCount = document.createElement('span');
    likesCount.textContent = `${likes}`;
    likesCount.classList.add('likes-count');

    likesButton.appendChild(heartIcon);
    likesButton.appendChild(likesCount);

    return likesButton;
}

/**
 * Creates the comments section for a blog post
 *
 * @param {Object} blogPost - The blog post object for which comments are created
 * @returns {HTMLElement} The HTML element representing the comments section
 */
function createCommentsElement(blogPost) {
    const commentElement = document.createElement('ul');
    commentElement.classList.add('comment-list');

    blogPost.comments.forEach((comment, index) => {
        const commentItem = document.createElement('li');

        // const userIcon = document.createElement('p');
        // userIcon.classList.add('heart-icon');
        // userIcon.src = 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png';
        // userIcon.alt = 'user';
        const userIcon = document.createElement('div');
        userIcon.classList.add('profile-icon');
        userIcon.innerHTML = '<i class="fa-solid fa-user"></i>';



        const commentContent = document.createElement('span');
        commentContent.textContent = `${comment.userName}: ${comment.content}`;

        const commentLikeButton = createLikeButton(comment.likes);

        commentItem.appendChild(userIcon);
        commentItem.appendChild(commentContent);
        commentItem.appendChild(commentLikeButton);
        commentElement.appendChild(commentItem);

        commentLikeButton.addEventListener('click', async () => {
            if (comment.liked || !loggedIn) {
                return;
            }
            try {
                const response = await fetch(`/blogs/${blogPost._id}/comment/like/${index}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'}
                });

                if (!response.ok) {
                    throw new Error('Failed to like the comment. Please try again.');
                }

                comment.likes++;
                commentLikeButton.querySelector('.likes-count').textContent = `${comment.likes}`;
                commentLikeButton.liked = true;
            } catch (error) {
                console.error('Error: ', error.message);
            }
        });
    });

    return commentElement;
}

/**
 * Creates a form for submitting comments on a blog post
 *
 * @param {string} blogPostId - The ID of the blog post for which the comment form is created
 * @returns {HTMLElement} The HTML form element representing the comment form
 */
function createCommentForm(blogPostId) {
    const commentForm = document.createElement('form');
    commentForm.classList.add('comment-form');

    const commentTextArea = document.createElement('textarea');
    commentTextArea.setAttribute('placeholder', 'Comment here...');
    commentTextArea.setAttribute('name', 'comment');
    commentTextArea.classList.add('form-control', 'mb-2');
    commentForm.appendChild(commentTextArea);

    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.textContent = 'Submit';
    submitButton.classList.add('btn', 'btn-primary');
    commentForm.appendChild(submitButton);

    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!loggedIn) {
            console.log('Please login to submit a comment.')
            return;
        }

        const formData = new FormData(commentForm);
        const commentContent = formData.get('comment');

        try {
            const response = await fetch(`/blogs/${blogPostId}/comment`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ content: commentContent, userID: userId })
            });

            if (!response.ok) {
                throw new Error('Failed to add comment. Please try again.')
            }

            commentForm.reset();
            console.log('Comment added successfully');
            await fetchAndDisplayBlogPosts();

        } catch (error) {
            console.error('Error: ', error.message);
        }
    });
    return commentForm;
}


//login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch('/users/login',  {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        if (!response.ok) {
            throw new Error('Login failed. Please try again');
        }

        const data = await response.json();
        userId = data._id;
        loggedIn = true;

        console.log('Login Successful: ', data);

        document.getElementById('loginFormContainer').style.display = 'none';
        document.getElementById('blogFormContainer').style.display = 'block';

        document.getElementById('userGreeting').innerHTML = `<h4>Hello, ${data.name}</h4>`;

        await fetchAndDisplayBlogPosts();   //do this again bc the functionality changes when a user logins

    } catch (error) {
        console.error('Error: ', error.message);
        document.getElementById('validation').innerHTML = `<p>${error.message}</p>`;
    } finally {
        event.target.reset();   //clears all the fields in the form
    }
});


//create new blog post
document.getElementById('blogPostForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const title = formData.get('postTitle');
    const content = formData.get('postContent');

    try {
        const response = await fetch('/blogs/',  {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content, author: userId })
        });

        if (!response.ok) {
            throw new Error('Failed to create new blog post. Please try again');
        }

        //reset form fields
        event.target.reset();

        //update the blog page after creating a new blog post
        await fetchAndDisplayBlogPosts();

        //optionally, you can show a success message to the user
        console.log('Blog post created successfully');

    } catch (error) {
        console.error('Error: ', error.message);

        const postValidation =  document.getElementById('postValidation');
        postValidation.innerHTML = `<p>${error.message}</p>`;
    } finally {
        event.target.reset();   //clears all the fields in the form
    }
})
