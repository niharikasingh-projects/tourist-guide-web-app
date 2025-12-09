# TouristGuideWebApp

The Tourist Guide App is a digital marketplace which connects tourists with local guides directly.
Guides set transparent, fixed rates for their services and tourists see this pricing before booking.
The platform verifies all guides and uses a review system to ensure quality and honest
experience for everyone
This is a responsive single-page web application that displays a list of tourist attractions.

## Functionality and modules:

###	Primary functions:
    -	Transparent guide booking: Tourists select a guide based on standardized,
    upfront pricing. Profile, ratings, language ensure transparency across all users.
    -	Real time request/match: Tourists can request for a guide immediately or
    schedule the service. The system matches them with available, nearby guides.
    -	Guide verification and profile: A process that verifies local guides and allows
    them to create detailed profiles.
    -	In-app payment system: Facilitate secure, cashless payments with a
    transparent breakdown of the guide’s fee + platform’s service charge
    -	Reviews and ratings: Allow tourists to view and post ratings for guides to
    ensure quality and accountability.
    -	Secondary functions:
    -	Map and navigation: Map view showing tourist’s current location, guide’s
    location and route guide for booked tours.
    -	Attractions directory: Simple list of landmarks, sites, tourist spots to be used as
    a reference during a guided tour
    -	Multi-language support: Content available in basic key languages for global
    usability.
    -	Modules
    -	User authentication: Sign up/login for tourists and local guides
    -	User profile/settings: Profile info, language, preferences, payment details
    -	Location module: Real time GPS tracking to match tourists to nearby guides.
    -	Booking and transaction: Service lifecycle of requesting, matching, booking
    confirmation, in-app processing and booking history.
    -	Review and rating: Collects and displays ratings and feedback of guides.
    Users (Roles and how they interact with system)
    -	Tourist (primary client):
    -	Explore: Search destination and services
    -	Books: Request and book verified guides with transparent, upfront pricing
    -	Uses: Follows map/route during a tour
    -	Reviews: Provide rating and feedback
###	Local guide (primary service provider)
    -	Register: Creates a verified profile with expertise, services, and fixed rates.
    -	Provides: Accepts or rejects service requests.
    -	Uses: Views booking schedule and navigates to the meeting point
    -	Manages: Withdraws earnings via the system.
    Number of user interfaces:
    -	Splash/Onboarding:  App intro, key value proposition
    -	Login/signup: Secure entry point for Tourists and Guides.
    -	Home screen Tourist: Map view, immediate search for guides, or quick access to planned trips.
    -	Guide: View of current status (online/offline) and list of new requests/scheduled
    bookings.
    -	Guide search/ explore: Filterable list/map of available guides with their standardized rates, ratings, and
    specialization.
    -	Booking/ request screen: Where the Tourist confirms service, price, date, and time before matching/booking.
    -	Map view/ live tracking: Real-time map to track the guide's arrival (pre-tour) or to show the route during the tour.
    -	User profile/ settings: To manage personal info, language preferences, and payment methods

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
