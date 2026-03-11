
import axios from 'axios';

async function test() {
    try {
        console.log("Testing http://127.0.0.1:5001/api/tasks...");
        const response = await axios.get('http://127.0.0.1:5001/api/tasks');
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);
    } catch (err) {
        if (err.response) {
            console.log("Error status:", err.response.status);
            console.log("Error data:", err.response.data);
        } else {
            console.log("Error message:", err.message);
        }
    }
}

test();
