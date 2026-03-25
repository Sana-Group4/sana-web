window.onload = load_details;

const token = localStorage.getItem("access_token")

const username = document.getElementsByClassName("profile-name")[0];
const id = document.getElementsByClassName("profile-id")[0];
const email = document.getElementById("email");
const phoneNumber = document.getElementById("phone");
const dob = document.getElementById("dob");

console.log(username)

async function load_details(){
    const res = await fetch("http://localhost:8000/api/account", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    
    const data = await res.json();

    username.innerHTML = data.firstName + " " + data.lastName;
    id.innerHTML = "ID: "+ data.id;
    email.textContent = data.email;
    if (data.phone){
        phoneNumber.textContent = data.phone
    }
    else phoneNumber.textContent = "Not set"
    if (data.dob){
        dob.textContent = data.dob
    }
    else dob.textContent = "Not set"
}