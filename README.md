# Amelie
 Amelie Suite is a set of software co-designed for people suffering from Rett's syndrome characterized by an innovative way of interaction between care-giver and care-receiver, both equipped with an instrument on their own device, and through the use of an eyetracker (which allows you to track the look of the subject and to determine which point on the screen is watching).


Amelie is an open source software and accessible to everyone, co-designed by designers, developers, university researchers, families and therapists. Amelie promotes communication and cognitive enhancement for learning and improving interaction and understanding skills.
The system integrates different technologies (mobile applications, cloud services and adaptive algorithms) to provide an innovative, comprehensive and easy-to-use service. 


The software was born from an idea of Associazione Italiana Rett - AIRETT Onlus and Opendot S.r.l., and was designed and developed by Opendot S.r.l., with the essential contribution of Associazione Italiana Rett - AIRETT Onlus.

This repository hosts the source code of the Amelie mobie application

# Amelie mobile

Amelie mobile is the care-giver app that includes all the commands to create and manage content and send it in real time to the care-receiver software installed on your computer.

## Technologies

### [React Native](https://github.com/facebook/react-native)
React Native helps in making the development work easier and allowing the developers to focus on the core app features in every new release. It is the fastest-developing mobile app development that essentially permits you to create an isolated product with often outcomes.

**The hymn of React Native — learn once, write anywhere.**

React Native takes charge of the view controllers and programmatically generates native views using javascript. This means that you can have all the speed and power of a native application, with the ease of development that comes with React.


### [NativeBase](https://nativebase.io/)

NativeBase is a free and open source framework.

This framework enable developers to build high-quality mobile apps using React Native iOS and Android apps with a fusion of ES6. NativeBase builds a layer on top of React Native that provides you with basic set of components for mobile application development.

The applications stack of components is built using native UI components and because of that, there are no compromises with the User Experience of the applications.  NativeBase is targeted specially on the look and feel, and UI interplay of your app.

NativeBase without a doubt fits in well with mobile applications which cut downs one huge part of your app The Front end.

-	*[On GitHub](https://github.com/GeekyAnts/NativeBase)*
-	*[NativeBase Features](https://docs.nativebase.io/)*
-	*[NativeBase Components](https://docs.nativebase.io/Components.html#Components)*
-	*[Docs](https://docs.nativebase.io/Components.html#Components)*
-	*[Blog](https://blog.nativebase.io/)*


### [Redux](http://redux.js.org)

As the requirements for JavaScript single-page applications have become increasingly complicated, our code must manage more state than ever before. UI state is also increasing in complexity, as we need to manage the active route, the selected tab, whether to show a spinner or not, should pagination controls be displayed, and so on.

Redux is a predictable state container for JavaScript apps. It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test.

Redux attempts to make state mutations predictable by imposing certain restrictions on how and when updates can happen. These restrictions are reflected in the steps of three.

-	The **state** of whole application is stored in an object tree within a single **store**.
-	The only way to mutate the state is to emit an **action**, an object describing what happened.
-	To specify how the state tree is transformed by actions, you write pure **reducers**.


### [React Navigation](https://reactnavigation.org/)
[React Navigation](https://reactnavigation.org/) is a routing package that allows you to:
  * Declare different kinds of Routers.
  * Routers fall into the category of **StackNavigator ,** **DrawerNavigator ,** and **TabNavigator**.
  * We can also nest these Routers for more complex transitions.



## Get Started

### 1. System Requirements

* Globally installed [node](https://nodejs.org/en/)

* Globally installed [react-native CLI](https://facebook.github.io/react-native/docs/getting-started.html)


### 2. Installation

On the command prompt run the following commands

```sh
$ git clone https://github.com/opendot/amelie-mobile.git

$ cd amelie-mobile/

$ npm install
```

```sh
$ react-native link
```


### 3. Simulate for iOS

**Method One**

*	Open the project in XCode from **ios/Airett.xcodeproj**

*	Hit the play button.


**Method Two**

*	Run the following command in your terminal

```sh
$ react-native run-ios
```

### 4. Simulate for Android

*	Make sure you have an **Android emulator** installed and running.

*	Run the following command in your terminal

```sh
$ react-native run-android
```

Note: If you are building this app for first time on your system, please follow Method One to simulate on iOS.
