# Create a reusable Web Component using Angular Elements

Angular components can be compiled into a web component, that you can use everywhere, even in non angular apps.
It will generate a web component, that you can define for your browser.
In order to do this, you need to make sure you are using `Angular 6` because there happens to be some problems with the new `Angular 7`.
If this is the case, you can run the following first commands:

> ng new elements-test

> cd angular-elements-test

> ng add @angular/elements

> npm install --save-dev concat fs-extra

The `@angular/elements` is quite obvious, the other two packages are for the compiling later on.

Now lets get started with some code.

Lets first have a look, how an example component could look like.
I will be editing the `app-component` but you are free to use any other component.

    @Component({
        selector: 'custom-element',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.css'],
        encapsulation: ViewEncapsulation.Native
    })  

The only thing to note here is setting the `encapsulation: ViewEncapsulation.Native`, which enables the ShadowDom.

In the component itself, you have a few ways to let others communicate with the you.
Say you have a component like the following.

    export class AppComponent implements OnInit{

        @Input() name = 'Simon';
        @Input() onclick = () => console.log('i got clicked');
        @Output('element-click') buttonClick = new EventEmitter<string>();

        onButtonClick() {
            if (typeof this.onclick == 'string') {
            this.onclick = eval(this.onclick);
            };
            this.onclick()
        }
        onSecondButtonClick() {
            this.buttonClick.emit('The second button got clicked!');
        }
    }

First you describe your `@Input`'s and `@Output`'s.
The `@Input`'s will be mapped to the tags which you can define at the element:

    <custom-element name="Frank"></custom-element>

Now we pass the string `Frank` to the component, where we can find it in the global attribute `name`.

The second function is for another button, where we want to emit our event emitter with an example string, but this will be used later.

After that, you need to modify the app `app.module.ts` a little bit:

    @NgModule({
        declarations: [AppComponent],
        imports: [BrowserModule],
        providers: [],
        entryComponents: [AppComponent]
    })
    export class AppModule {
        constructor(private injector: Injector) {
            const el = createCustomElement(AppComponent, { injector });
            customElements.define('custom-element', el);
        }
        ngDoBootstrap() { }
    }

Important is, that you define the component as a entry instead of a bootstrap component. 
You then need to call the `ngDoBootstrap` method in the `AppModule` because Angular expects the bootstrapping somewhere.
The code in the constructor is where we create the custom element and define it to the browser where this code runs.

When your component is now finished, you need to compile it the right way.
Create a new file, e.g. `build-elements.js` with the content as follows:

    const fs = require('fs-extra');
    const concat = require('concat');

    (async function build() {
        const files = [
            './dist/angular-elements-test/runtime.js',
            './dist/angular-elements-test/polyfills.js',
            './dist/angular-elements-test/scripts.js',
            './dist/angular-elements-test/main.js'
        ];

        await fs.ensureDir('elements');
        await concat(files, 'elements/angular-elements-test.js');
    })();

To understand this, you need to know that when running `ng build --prod --output-hashing none`, Angular will create a `dist/angular-elements-test` folder containing the four files `runtime.js`, `polyfills.js`, `scripts.js` and `main.js`.
Everything the method does, is to combine these four JavaScript files to one file, so everything can then later be imported with one line of code.

One last thing you need to add, is to prevent a bug that can happen because of the ES version. 
The compiler needs the Version `ES2015` to properly run.
To define this, open the `tsconfig.app.json` and add the line `"target": "es2015"`:

    {
        "extends": "../tsconfig.json",
        "compilerOptions": {
            "outDir": "../out-tsc/app",
            "module": "es2015",
            "types": [],
            "target": "es2015"  //  This line needs to be added
        },
        "exclude": [
            "src/test.ts",
            "**/*.spec.ts"
        ]
    }

Now to build you component, you run the command:

> ng build --prod --output-hashing none && node build-elements.js

This command actually consists of two operations.
The first one builds the Angular app for production mode and prevents to output hashing. 
This means the files won't have hash-codes in their names and you can address them with the same name all the time.
The second one runs the script that we wrote earlier.

After this operations are finished, you will have a folder named `elements` containing one `.js` file, which contains all the code for the Angular environment and your component.

Now that you have a `angular-elements-test.js` file containing all the necessary source code, we can use this in a plain web page. 
To do this, we create a `index.html` file in the same folder where we have the new `.js` file.

In this `index.html` file we put the following.

    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Document</title>
            <base href="/">
        </head>
        <body>
            <h1>This is just a plain HTML page</h1>
            <br>
            <custom-element name="My Name"></custom-element>
            <script type="text/javascript" src="angular-elements-test.js"></script>
        </body>
    </html>

This looks pretty straight forward, because we are using the standard `html` line up.
The only thing that differs is the `<custom-element>` - Tag in the body.
This can be used, because we also import the `angular-elements-test.js` as a script. 
Importing this script runs the `app.module.ts`, which defines the `custom-element` component to the browser.

To run this little html page, you can just set up a small local http server.
For this you can for example install `http-server` globally.

> npm install http-server -g

After finishing this, just navigate the terminal to the folder where you created your `index.html` and enter:

> http-server

This runs a local server instance on your computer.
When it runs, it will tell you on which port you can find the webpage, e.g. `http://127.0.0.1:8080`.
I recommend opening this url in `Google Chrome`, but some other browsers work too.
If everything was entered correctly, you will see a website with one `<h1>`, one `<h2>` tag and two buttons.
Now you can open the developer tools and inspect the DOM.
There you will see that the `<custom-element>` is actually in your DOM.
You can also hit the first button and it will print something to the console.

The web component is now finished and you can either stop here, or we continue to check how we can interact with the underlying Angular component.

If you remember, we defined two things in the component which we didn't use yet:

    @Input() onclick = () => console.log('i got clicked');
    @Output('element-click') buttonClick = new EventEmitter<string>();

Let's first check how we can use the event emitter. 
This emitter defines an event which is called `element-click` on which we can listen to.

To do this we need to give our component a id, so we can find it:

        <custom-element id="my-element" name="My Name"></custom-element>

Now we can find it in the document and add an event listener:

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            document
                .getElementById('my-element')
                .addEventListener('element-click', (event) => {
                    console.log('my custom listener:', event.detail);
                });
        });
    </script>

Here we first add en event listener to the document, so we know when the DOM has been loaded.
When this event fires, we can search the document for our component and add the event listener with the name we defined in the `@Output` of the Angular component.
When we now emit this event in the Angular component, the event listener will be triggered and the code in the arrow function will be run.
The function will also receive a `event` object, which has a `detail` attribute, where we can find our string we emitted with the event.

    this.buttonClick.emit('The second button got clicked!');

With these events, we can communicate from the Angular component with the document where the component will be used.

Maybe we also want to change the behavior of our Angular component.
This is where things get a little bit hackie.
We defined our click handler for the first button also as a `@Input()`.
This means we can provide something different for this value.

    <script>
        function customHandler() {
            console.log('my own handler')
        }
    </script>

    <custom-element onclick="customHandler"></custom-element>

Important is, that you use the function without actually calling it (don't use parentheses).
Now this function name will be passed to the component as a string and will be used in the `onButtonClick` function.

    onButtonClick() {
        if (typeof this.onclick == 'string') {
            this.onclick = eval(this.onclick);
        };
        this.onclick()
    }

This is where the if-clause comes into play and evaluates the string into code which can actually be called.
At this time, the script you defined in your `index.html` will be available and the component can call your functions like the `customHandler`.

I think this enough to understand how much you can do with Angular Elements and the Web Components standard at the moment. 
This is just a example project that shows some basic usage, but the technology is still quite new and will therefore be under a lot of changes in the future.