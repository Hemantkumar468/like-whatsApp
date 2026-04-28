import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { setInitialMessages, addMessage, setUsername } from './features/chatSlice';
import { Send, User, MessageCircle } from 'lucide-react';

const socket = io('http://localhost:3001');

function App() {
  const dispatch = useDispatch();
  const { messages, currentUser } = useSelector((state) => state.chat);
  const [text, setText] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(currentUser);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('initial_messages', (msgs) => {
      dispatch(setInitialMessages(msgs));
    });

    socket.on('receive_message', (msg) => {
      dispatch(addMessage(msg));
    });

    return () => {
      socket.off('initial_messages');
      socket.off('receive_message');
    };
  }, [dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;

    socket.emit('send_message', {
      user: currentUser,
      text: text
    });
    setText('');
  };

  const handleSaveUsername = () => {
    if (tempUsername.trim() !== '') {
      dispatch(setUsername(tempUsername));
    }
    setIsEditingUsername(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sm:p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <MessageCircle className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight m-0">Global Chat</h1>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                Real-time
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditingUsername ? (
              <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="bg-transparent text-slate-200 px-3 py-1 outline-none w-28 sm:w-40 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                />
                <button 
                  onClick={handleSaveUsername}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingUsername(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl transition-all shadow-sm group cursor-pointer"
              >
                <div className="bg-slate-700 group-hover:bg-slate-600 p-1 rounded-md transition-colors">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="font-medium text-sm hidden sm:block">{currentUser}</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-full">
                <MessageCircle className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-lg">No messages yet. Be the first to say hi!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user === currentUser;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                  <span className={`text-xs font-medium mb-1.5 px-1 ${isMe ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {msg.user}
                  </span>
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm relative group ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                  }`}>
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    <span className={`text-[10px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                      isMe ? 'right-1 text-slate-400' : 'left-1 text-slate-400'
                    }`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 z-10">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={text.trim() === ''}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center w-14 cursor-pointer"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
