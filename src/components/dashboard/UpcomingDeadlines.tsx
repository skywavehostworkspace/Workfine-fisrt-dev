// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const UpcomingDeadlines = ({ workspaceId }: { workspaceId: string }) => {
  const [daysAhead, setDaysAhead] = useState(7);
  const today = new Date().toISOString();

  const tasks = useQuery(api.tasks.getUpcomingDeadlines, {
    workspaceId,
    daysAhead,
    today
  });

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDateBadge = (dueDate: string) => {
    const days = getDaysRemaining(dueDate);
    
    if (days === 0) return (
      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
        Today
      </span>
    );
    if (days === 1) return (
      <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
        Tomorrow
      </span>
    );
    if (days >= 2 && days <= 7) return (
      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
        In {days} days
      </span>
    );
    return (
      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
        In {days} days
      </span>
    );
  };

  const getInitialsColor = (initials: string) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 
      'bg-pink-500', 'bg-emerald-500', 'bg-orange-500'
    ];
    let hash = 0;
    if (initials) {
      for (let i = 0; i < initials.length; i++) {
        hash = initials.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="w-full bg-white rounded-xl border border-[#D9DBE9] shadow-sm p-6 animate-fade-in mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold font-heading flex items-center gap-2">
            Upcoming Deadlines <span role="img" aria-label="clock">⏰</span>
          </h2>
          <p className="text-sm text-[#6E7191]">Tasks due in the next {daysAhead} days</p>
        </div>
        
        <div className="flex bg-[#F7F7FC] p-1 rounded-full border border-[#D9DBE9]">
          {[3, 7, 14].map((d) => (
            <button
              key={d}
              onClick={() => setDaysAhead(d)}
              className={`px-4 py-1 text-xs font-bold transition-all rounded-full ${
                daysAhead === d 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-[#A0A3BD] hover:text-[#6E7191]'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
        {tasks === undefined ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-[140px] bg-gray-50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {tasks.map((task: any) => (
              <div 
                key={task._id} 
                className="w-full bg-white border border-[#D9DBE9] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.projectColor || '#6E7191' }}></div>
                  <span className="text-[10px] text-[#A0A3BD] font-medium uppercase truncate">
                    {task.projectName}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#14142B] mb-4 line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors">
                  {task.name}
                </h4>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F7F7FC]">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${getInitialsColor(task.assigneeInitials)}`}>
                      {task.assigneeInitials || '??'}
                    </div>
                    <span className="text-[10px] text-[#6E7191] font-medium truncate max-w-[60px]">
                      {task.assigneeName}
                    </span>
                  </div>
                  {getDateBadge(task.dueDate)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-[#6E7191]">No deadlines coming up 🎯 You're ahead of schedule!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D9DBE9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A0A3BD;
        }
      `}</style>
    </div>
  );
};

export default UpcomingDeadlines;
