
import { ChatInterface } from "@/components/chat/chat-interface";

export default function Chat() {

  return (
    <div className={`overflow-y-auto h-[calc(100vh-3.5rem)] "w-screen" transition ease-in-out`}>
      <div className="h-full w-1/2 mx-auto">
        <ChatInterface />
      </div>
    </div>
  )
};