Feature: WebsiteInteraction

    Scenario: User navigates to the website homepage
        Given the user has a web browser open
        When the user navigates to the URL "http://www.example.com"
        Then the homepage of "Example Website" should be displayed


    Scenario: Successful login with valid credentials
        Given the user is on the 'login' page
        When the user enters a valid username and password
        And the user clicks on the login button
        Then the user should be redirected to their dashboard

    Scenario: Unsuccessful login with invalid credentials
        Given the user is on the login page
        When the user enters an invalid username or password
        And the user clicks on the login button
        Then an error message "Invalid username or password" should be displayed


    Scenario: Accessing a page that requires authentication
        Given the user is not logged in
        When the user tries to navigate to a protected page
        Then the user should be redirected to the login page
        And a message "Please log in to access this page" should be displayed


    Scenario: Navigating to a specific section from the homepage
        Given the user is on the homepage
        When the user clicks on the "About Us" link
        Then the "About Us" page should be displayed



    Scenario: User logs out of the website
        Given the user is logged in and on their dashboard
        When the user clicks on the logout button
        Then the user should be logged out
        And the homepage should be displayed
