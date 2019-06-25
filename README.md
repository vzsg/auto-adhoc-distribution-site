# Even Simpler iOS Ad Hoc Distribution Site

A simple, automatic site for the ad doc distribution of an iOS app ready for deployment on Heroku. Loosely based on this [Ad Hoc iOS distribution website starter](https://github.com/mhgbrown/simple-ios-ad-hoc-distribution-site).

## Warning

Packages are dumped into the application image (slug) itself, so large files might overshoot the slug size limitations, and adversely affect deployment times.

## New Features

- Support for serving multiple applications
- Automatic discovery of IPAs from the `/apps` folder
- Automatic manifest.plist generation
- Forced HTTPS and other security tricks when running on Heroku (via Helmet)

## Usage

1. Download or clone the contents of this repository.
2. Drop all the IPAs that you want to make available in the `/apps` folder.
3. Create a Heroku application and deploy the repository to it.

    Example:

    ```
    git init
    git add .
    git commit -m "Initial commit"
    heroku apps:create adhoc-distribution-example
    git push heroku master
    ```

4. Navigate to the application.

    ```
    heroku open
    ```

