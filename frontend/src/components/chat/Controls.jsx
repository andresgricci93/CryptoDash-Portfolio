import {useState} from "react";


const Controls = ({onSend}) => {


   const [content, setContent] = useState("");

    const handleContentChange = (e) => {
    setContent(e.target.value)
    }

    const handleContentSend = () => {
        if (content.length > 0) {
          onSend(content);
          setContent("");
        }
    }

    const handleEnterPress = (e) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       handleContentSend();
     }
    }

   return (
    <div className="flex items-center mt-[17px] gap-4 w-[100%]">
        <div className="flex items-center gap-1  bg-white rounded h-12 mb-[1px] flex-1 p-2 overflow-x-auto">
            <input 
              type="text"
              className="bg-transparent mt-[1px] text-black outline-none w-full"
              placeholder="Message CryptoDash AI "
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleEnterPress}
            />
          </div>
         <button onClick={handleContentSend}>
          <SendIcon className="ml-1"/>
         </button>
    </div>
   )
}


const SendIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>
    );
}


export default Controls;