// let a = [4, 8, 15, 16, 23, 42];
// let b = ['David', 'Sarah', 'Tom', 'Jill', 'James'];

// console.log(a[2]);
// console.log(a[4]);
// console.log(a);


// console.log(typeof a);

let ca = [4, 'Joe', false];

console.log(ca);

console.log(ca[4]);
console.log(ca.length);



// https://www.youtube.com/watch?v=m55PTVUrlnA
//normal function.
// function Dosomething(){}
//exporting to another file do export default function Dosomething(){};

// arrow functions...
// const arrowfunc = () => {}
// export to another file is just export arrowfunc = () =>{};

// In react this arrow functions is important because this is how you define components. eg:
    const MyComponent = () => { 
        return <div> </div>
    }

    //anonymous functions are functions that do Not have a name...
// anonymous functions in react..:
    <button onClick={ () =>{ console.log("Hello World.")}}
    ></button>


// working with conditions..// ternary operators..
let age = 12;
//let name = "David";

// if(age > 18){
//     console.log("You are an adult.");
// } else {
//     console.log("You are a minor.");
// }
// a shorter way of doing above is via a ternary operator.

// && ==IF
let age = 12; let name = age > 13 && "Joe / false"; console.log(name) //false
let age = 12; let name = age > 10 && "Joe / false"; console.log(name) //Joe / false

// || ==OR 
let age = 12; let name = age > 13 || "Joe / false"; console.log(name) //Joe / false
let age = 12; let name = age > 10 || "Joe / true"; console.log(name) //True

// If Else operators..: =?(If) =:(Else) statement 
// let name = 13 > age ? "True" else "false";
let age = 18; 
let name = 13 > age ? "Jack" : "Jill";
console.log(name);

//using the above with a component..:
const Component = () => {
  return age > 10 ? <div>Jack</div> : <div>Jill</div>;
};

//objects are needed.. (dictionaries in python or hash tables hash maps etc..)
// example  object:
const person = {
    name: "Jack",
    age: "49",
    isMarried: false,
};
const name = person.name;
const age = person.age;
const isMarried = person.isMarried;
//Above takes up to much space need to destructure the objects..
const {name, age, isMarried} = person; // Same as Above just shorter using the destructuring mechanism..

// Object can be assigned variables directly without needing the ":" notation..:
let age = 18; 
const person = {
    name: "Jack",
    age, // here age has been set to 18 per above..
    isMarried: false,
};

//how to copy and object and just change one variable, here we can use the spread operator..
const person = {
    name: "Jack",
    age: "49",
    isMarried: false,
};
const person2 = {...person,age:50}// person 2 is exactly the same as person 1 but is 50 years not 49 years..

console.log(person2);

//works the same with arrays, here we adding the element with "John" on the end..
const names = ["Jack", "James", "Joel"]
const names2 = [...names,"John"]
console.log(names2)
console.log(names2.length)

// Working with the three main functions of javascript.
.map()//
.filter()//
.reduce() // not used allot..

//.map() function example say we have an array and we need to just add 1 on each of the elements... 
    const names = ["Jack", "Pedro", "Ollie"]
    names.map((nameV)=>{
        console.log(nameV+"2");
    }) // iterate through each element of the array.. Lets give it an argument "nameV" or what ever, here we adding 2 on each element.."

    // So in react we can do the below.. this will Generate a header for each element in the list.
    names.map((name) =>{
        return <h1>name </h1>
    })

    //.filter() function example (( on the site it is used for searching or filtering through lists..))
    //remove "Pedro" from names array..
    let names = ["Jack", "Pedro", "Ollie", "Pedro", "Andy"];
    names.filter((namee) => {
        
        return console.log(namee !== "Pedro") ;
    })

    // working with API`s.. using promises etc..
    // recommend fetch api first..
    Asynch + Await + fetch;


    