# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). Users can register an account and login to see the urls they created.

## Final Product

!["/urls page displaying user's created urls"](https://github.com/clarchiu/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["/urls/:id page for editing url"](https://github.com/clarchiu/tinyapp/blob/master/docs/urls-edit.png?raw=true)
!["/urls/new for creating new url"](https://github.com/clarchiu/tinyapp/blob/master/docs/urls-new.png?raw=true)
!["/register page for creating an account"](https://github.com/clarchiu/tinyapp/blob/master/docs/register-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

### Comments

I'm someone who's a bit (too) obsessed with refactoring and couldn't get over how messy each route handler was getting initially. The refactoring process for this project was actually really rewarding because I was able to practice and appreciate functional programming even more. I want to share with you what I came up with to DRY up my code. There were basically two patterns (both has to do with authentication) that were repeat WET offenders:

1. if user is logged in then do something, else do another thing
2. if user owns url then do something, else do another thing

After some mind wrestling, I figured out that I could just refactor out these patterns into helper functions that take two callbacks (one for when the condition is true and one for false). The helper for the first pattern looked like this:

```
const checkUserLoggedIn = (req, onFalse, onTrue) => {
  const uid = getUserIdFromCookie(req);
  const user = users[uid];
  if (!uid || !user) {
    onFalse(uid, user);
    return;
  }
  onTrue(uid, user);
};
```
And now, in my route handlers for "/register" and "/login", which all they do is redirect the user depending on if logged in, I call the helper like this:

```
//inside handler
checkUserLoggedIn(req,
    () => res.render("login"), //not logged in
    () => res.redirect("/urls")); //logged in
```
And whereever this pattern showed up I called this helper function, which I think made it ALOT easier to read than a bunch of if statements. There were also WAY less lines of just variable declarations crowding each route because the helper already gets the session cookie and user which could just be passed to the callbacks if needed.

A benefit of handling `onFalse` first is that typically the code for when authentication fails is just easy one liners. Passing `onFalse` first would make it easier to read. Another another added benefit is taking advantage of Javascripts short circuiting with `||`. If any of the preceding conditionals evaluate to true, there is no need to evaluate the rest of them and `onFalse` can be called right away.

I originally tried writing custom middleware to handle authentication at first because I read it is THE standard practice for real websites. But our project deliverables were kinda weird in the way that they asked us to handle authentication differently depending on where the user was currently at. This would involve different functions for EACH scenario, which would quickly become an anti-pattern. 

If you made it this far, thanks for reading my long spiel.
