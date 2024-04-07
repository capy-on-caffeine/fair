import React, { useState } from 'react';
import axios from 'axios';
import users from '../data.json'

const UploadImageComponent = () => {
  const [image, setImage] = useState(null);

  const handleImageUpload = async () => {
    const base64Image = await convertImageToBase64(image);

    try {
      const promptResponse = await axios.post('http://8.12.5.48:11434/api/generate', {
        model: 'llava:7b-v1.6-mistral-q5_K_M',
        // prompt: 'Describe the image',
        prompt: 'You need to describe the physical features of the object in the image for identification. Output these keywords as comma separated values. The output must include the object, its color, and its brand. The model is also preferable. For example, "phone,red,samsung,three cameras,stylus", "mug,white,archies,photo of woman"',
        images: [base64Image],
        stream: false,
      });
      const keywordsFromModel = promptResponse.data.response;
      console.log('Response from server:', keywordsFromModel);
      try {
        for (user in users) {
          keywords = user.keywords;
            const tf = await axios.post('http://8.12.5.48:11434/api/generate', {
              model: 'llava:7b-v1.6-mistral-q5_K_M',
              prompt: 'just answer in one word (true/false) if you think the following two sets of words are similar: "' + keywordsFromModel + '", "' + keywords + '"',
              stream: false,
            });

            if (tf == 'true') {
              console.log(user.name)
            }
        }
      } catch (error) {
        console.log("Error: ", error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const convertImageToBase64 = (image) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(image);
    });
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleImageUpload}>Upload Image</button>
      <textarea id='res'></textarea>
    </div>
  );
};

export default UploadImageComponent;
