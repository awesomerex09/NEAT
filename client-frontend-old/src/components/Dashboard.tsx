import { STUDENT_PROFILES, WORKOUT_SCHEDULES } from '../data/importedData';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Calendar, Target, LogOut, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  userUID: string;
}

export default function Dashboard({ userUID }: DashboardProps) {
  const profile = STUDENT_PROFILES.find(p => p.firebaseUID === userUID);
  const workouts = WORKOUT_SCHEDULES.filter(w => w.studentUID === userUID);

  const handleLogout = () => {
    signOut(auth);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white w-full">
        <h2 className="text-xl font-semibold mb-4">找不到您的專屬資料</h2>
        <p className="text-zinc-400 mb-6">請聯繫您的教練，確認已為您的 Google 帳號建立學員檔案。</p>
        <button onClick={handleLogout} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
          <LogOut size={18} /> 登出
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white w-full">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            歡迎回來, {profile.name}
          </h1>
          <button 
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg"
          >
            <LogOut size={16} /> 登出
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Periodization Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
              <Target size={24} />
            </div>
            <h2 className="text-2xl font-bold">訓練週期與目標</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-purple-500/50 transition-colors">
              <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div> 短期目標
              </h3>
              <p className="text-zinc-300 text-lg">{profile.shortTermGoal}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-colors">
              <h3 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div> 中期目標
              </h3>
              <p className="text-zinc-300 text-lg">{profile.midTermGoal}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-blue-500/50 transition-colors">
              <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div> 長期目標
              </h3>
              <p className="text-zinc-300 text-lg">{profile.longTermGoal}</p>
            </div>
          </div>
        </section>

        {/* Schedules Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
              <Calendar size={24} />
            </div>
            <h2 className="text-2xl font-bold">訓練菜單與預約時間</h2>
          </div>

          <div className="space-y-4">
            {workouts.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400">
                目前沒有安排中的課表。
              </div>
            ) : (
              workouts.map(workout => (
                <div key={workout.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
                  <div className="bg-zinc-800/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800">
                    <div className="flex items-center gap-4 text-zinc-300">
                      <span className="font-mono text-lg">{workout.date}</span>
                      <span className="bg-zinc-700 px-3 py-1 rounded-full text-sm">{workout.timeSlot}</span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-400/10 px-3 py-1 rounded-full">
                        <CheckCircle2 size={16} />
                        {workout.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-zinc-500 mb-3 uppercase tracking-wider">今日訓練內容</h4>
                    <ul className="space-y-2">
                      {workout.exercises.map((exercise, index) => (
                        <li key={index} className="flex items-start gap-3 text-zinc-300">
                          <span className="text-zinc-600 font-mono text-sm mt-0.5">{String(index + 1).padStart(2, '0')}</span>
                          <span>{exercise}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
