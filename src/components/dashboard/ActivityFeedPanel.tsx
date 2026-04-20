// @ts-nocheck
import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const ActivityFeedPanel = ({ workspaceId }: { workspaceId: string }) => {
  const activities = useQuery(api.activity.getTeamActivityFeed, { workspaceId }) || [];

  const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  const getInitialsColor = (initials) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 
      'bg-pink-500', 'bg-emerald-500', 'bg-orange-500'
    ];
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white rounded-xl border border-[#D9DBE9] shadow-sm p-6 flex flex-col h-[380px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold font-heading flex items-center gap-2">
            Activity Feed <span role="img" aria-label="satellite">📡</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </h3>
          <p className="text-xs text-[#6E7191]">What's happening across your team</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activities.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activities.map((item) => (
              <div key={item._id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${getInitialsColor(item.userInitials)}`}>
                  {item.userInitials}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-xs">
                    <span className="font-bold text-[#14142B]">{item.userName}</span>
                    {" "}
                    {item.assigneeName && item.assigneeName !== item.userName ? (
                      <span className="text-[#6E7191]">
                        created and assigned{" "}
                        <a href={`/tasks/${item.taskId}`} className="text-indigo-600 font-medium hover:underline">
                          {item.taskName}
                        </a>
                        {" "}to <span className="font-bold text-[#14142B]">{item.assigneeName}</span>
                      </span>
                    ) : (
                      <>
                        <span className="text-[#6E7191]">{item.action}</span>
                        <p className="text-xs truncate">
                          <a href={`/tasks/${item.taskId}`} className="text-indigo-600 font-medium hover:underline">
                            {item.taskName}
                          </a>
                        </p>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-[#A0A3BD] mt-1">
                    {formatRelativeTime(item._creationTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-[#6E7191]">No recent activity yet 👀</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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

export default ActivityFeedPanel;
