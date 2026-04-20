
// @ts-nocheck
import React from 'react';
/* 
Note: This component is designed for a Next.js/Convex/Clerk environment.
In the current vanilla JS prototype, this functionality is mirrored in the main dashboard renderer.
*/

// Mocking useQuery and api for documentation/instruction compliance
const useQuery = (api: any, args: any) => ({ 
    overdue: [], 
    dueToday: [], 
    upcoming48hrs: [] 
});
const api = { tasks: { getMyFocusTasks: {} } };
const useUser = () => ({ user: { id: "u1" } });

const MyFocusStrip = () => {
  const { user } = useUser();
  const today = new Date().toISOString();
  
  const focusData = useQuery(api.tasks.getMyFocusTasks, { 
    userId: user?.id, 
    today 
  });

  if (!focusData) return null;

  const allFocusTasks = [
    ...focusData.overdue.map(t => ({ ...t, type: 'overdue' })),
    ...focusData.dueToday.map(t => ({ ...t, type: 'today' })),
    ...focusData.upcoming48hrs.map(t => ({ ...t, type: 'upcoming' }))
  ];

  return (
    <div className="w-full bg-white rounded-xl border border-[#D9DBE9] border-l-4 border-indigo-500 shadow-sm p-6 pl-6 mb-10 flex flex-col md:flex-row items-center gap-6 animate-fade-in">
      <div className="flex-shrink-0 text-left">
        <h2 className="text-lg font-bold font-heading flex items-center gap-2">
          My Focus Today <span role="img" aria-label="target">🎯</span>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
            {allFocusTasks.length} {allFocusTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </h2>
        <p className="text-sm text-[#6E7191]">Here's what needs your attention</p>
      </div>

      <div className="flex-1 flex flex-wrap gap-3">
        {allFocusTasks.length > 0 ? (
          allFocusTasks.map((task: any) => (
            <div 
              key={task._id}
              className={`flex items-center gap-2 bg-white rounded-lg shadow-sm p-3 border-l-4 text-sm transition-all hover:translate-y-[-2px] hover:shadow-md cursor-pointer
                ${task.type === 'overdue' ? 'border-red-500' : 
                  task.type === 'today' ? 'border-amber-400' : 'border-blue-400'}`}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-[#14142B] truncate max-w-[150px]">
                  {task.name.length > 24 ? task.name.substring(0, 24) + '...' : task.name}
                </span>
                <span className="text-[10px] text-[#6E7191] uppercase">{task.projectName}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                ${task.priority === 'high' ? 'bg-[#F03D3D] text-white' : 
                  task.priority === 'med' ? 'bg-[#F5A623] text-white' : 'bg-[#D9DBE9] text-[#6E7191]'}`}>
                {task.priority.toUpperCase()}
              </span>
            </div>
          ))
        ) : (
          <p className="w-full text-center text-[#6E7191] text-sm py-2">
            You're all caught up! 🎉
          </p>
        )}
      </div>
    </div>
  );
};

export default MyFocusStrip;
