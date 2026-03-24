import { createRoot } from "react-dom/client";

let ImageURL="https://picsum.photos/200/300"
let theme= "light" // "dark"

let someFunc =() =>{
    console.log("Hello World")
}

let Header =() =>{
    return (
            <h1 onClick={()=>{console.log("This is About page")}}>About Page</h1>
    )
}

let name= "Batman"
let template = (
    <div>
        <button onClick={someFunc}>Click Me</button>
        <label htmlFor="first-name">First Name</label>
        <input id="first-name" />
        <h1 className={theme === "light" ? "light-theme" : "dark-theme"}>I am {name}</h1>
        <img src={ImageURL} alt="dogu" />

        <Header />
    </div>

);

createRoot(document.getElementById("messi")).render(template)
