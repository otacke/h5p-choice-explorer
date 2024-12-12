# H5P Boilerplate (SNORDIAN)
This is a quite simple boilerplate template that you can use to create your
own content types. It is really only a very basic template. If you are creating
some "question-like" content type, you should definitely look into how other
content types use [xAPI](https://h5p.org/node/3391), how they use the library
[H5P.Question](https://github.com/h5p/h5p-question) and how they support the
[question type contract](https://h5p.org/documentation/developers/contracts).

The boilerplate code uses plain JavaScript. It could have used all kinds of
extensions such as TypeScript, it could have used all kinds of frameworks such
as React or Vue or ... But on the one hand, it is more important to know how
JavaScript works as a foundation of all the others. On the other hand, most of
the code written by H5P Group also uses plain JavaScript, so hopefully this will
make it a little easier for you to compare code across different repositories in
order to learn how H5P can be used.

This boilerplate features a build chain that allows to do a couple of things,
e.g. transpile your JavaScript code so it potentially also runs on some older
browser versions, bundles and compresses files so they require less space, etc.
The pieces of software used here are [webpack](https://webpack.js.org/) and
[Babel](https://babeljs.io/) that you may want to check out if you want to
change details. Other people prefer other software to do this kind of work, but
H5P Group also uses them. So, sticking to those will make it a little easier
to find your way in the H5P world.

The code that you write can also be "linted" - checked for violations of some
rules for the code. The boilerplate already contains
configuration files for [eslint](https://eslint.org/) that lints JavaScript and
for [Stylelint](https://stylelint.io/) that lints CSS (or SCSS in this case).
Those configurations comply with the H5P Coding guidelines
([1](https://h5p.org/documentation/for-developers/coding-guidelines) and
[2](https://h5p.org/documentation/for-developers/coding-guidelines)) and extend
them a little bit, so the configurations are a little stricter. If you use a modern development environment such as
[Visual Studio](https://visualstudio.microsoft.com/), then it will show you
problems with your code while you type it. You can also run the linters later
on and they will tell you what's wrong. And they could even fix some issues
automatically - that's for you to explore :-) Again, one could use different
linters, but H5P Group uses eslint and you may find it easier to find your way
through different repositories. Same goes for other style rules that ond might
prefer.

The `.h5pignore` file is not explained in the official documentation. It follows
the same syntax and idea of a [.gitignore](https://git-scm.com/docs/gitignore)
file - to filter out files from your repository that should not end up in the
distribution files. The [H5P CLI tool](https://h5p.org/h5p-cli-guide) uses this
file.

Ultimately, there is a github workflow that will run when you push to a `master`
branch or someone creates a pull request to your repository. It will check if
the code builds fine, if the linters find bugs, and if the translation files
seem okay. You may want to remove or modify that workflow if you don't use
github, if your master branch is not named `master`, etc.

## Getting started
Clone this repository with git and check out the branch that you are interested
in (or choose the branch first and then download the archive, but learning
how to use git really makes sense).

Change to the repository directory and run
```bash
npm install
```

to install required modules. Afterwards, you can build the project using
```bash
npm run build
```

or, if you want to let everything be built continuously while you are making
changes to the code, run
```bash
npm run watch
```
Before putting the code in production, you should always run `npm run build`.

Also, you should run
```bash
npm run lint
```
in order to check for coding style guide violations.

In order to pack an H5P library, please install the
[H5P CLI tool](https://h5p.org/h5p-cli-guide) instead of zipping everything
manually. That tool will take care of a couple of things automatically that you
will need to know otherwise.

In simple cases, something such as
```bash
h5p pack <your-repository-directory> my-awesome-library.h5p
```
will suffice.

For more information on how to use H5P, please have a look at
https://youtu.be/xEgBJaRUBGg and the H5P developer guide at
https://h5p.org/library-development.
