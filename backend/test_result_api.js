import axios from 'axios';

async function testResultApi(id) {
    try {
        const res = await axios.get(`http://localhost:8000/api/result/${id}`);
        console.log('API Response:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('API Error:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    }
}

// Using the ID from the user's screenshot
const testId = '69c0c7cc71387698b1c770ce';
testResultApi(testId);
