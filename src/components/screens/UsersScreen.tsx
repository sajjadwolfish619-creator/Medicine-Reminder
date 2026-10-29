import React, { useState } from 'react';
import { UserProfile, Medication } from '../../types';
import { processImageUpload } from '../../utils/storage';
import { translations, Language } from '../../utils/i18n';
import { 
  UserPlus, 
  Edit3, 
  Trash2, 
  Camera, 
  X, 
  Pill, 
  AlertTriangle 
} from 'lucide-react';

interface Props {
  users: UserProfile[];
  medications: Medication[];
  historyLogs: any[];
  activeUserId: string;
  lang: Language;
  onSelectUser: (userId: string) => void;
  onSaveUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersScreen: React.FC<Props> = ({
  users,
  medications,
  activeUserId,
  lang,
  onSelectUser,
  onSaveUser,
  onDeleteUser,
}) => {
  const t = translations[lang];
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUserName('');
    setAvatarUrl(undefined);
    setIsEditing(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setUserName(user.name);
    setAvatarUrl(user.avatarUrl);
    setIsEditing(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageUpload(file);
      setAvatarUrl(dataUrl);
    } catch (err) {
      console.error('Error uploading avatar:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const userToSave: UserProfile = {
      id: editingUser ? editingUser.id : `usr_${Date.now()}`,
      name: userName.trim(),
      avatarColor: '#0284c7', // Minimal light blue
      avatarUrl,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
    };

    onSaveUser(userToSave);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24 text-slate-800 bg-sky-50/50">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.allUsers}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.switchPrompt}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 transition shadow-xs shadow-sky-200 active:scale-95 cursor-pointer"
        >
          <UserPlus size={15} />
          <span>{t.add}</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {users.map((user) => {
          const isActive = activeUserId === user.id;
          const userMedsCount = medications.filter((m) => m.userId === user.id).length;
          const isDeleting = deleteConfirmId === user.id;

          return (
            <div
              key={user.id}
              className={`p-4 rounded-3xl border transition-all relative overflow-hidden bg-white shadow-xs ${
                isActive
                  ? 'border-sky-400 ring-2 ring-sky-200 shadow-md shadow-sky-100 bg-sky-50/30'
                  : 'border-sky-100 hover:border-sky-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  onClick={() => onSelectUser(user.id)}
                  className="flex items-center gap-3.5 flex-1 cursor-pointer"
                >
                  {/* User Avatar */}
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-300 shadow-xs"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xs flex-shrink-0 bg-sky-500"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {user.name}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                          {t.active}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Pill size={12} className="text-sky-500" />
                      <span>{userMedsCount} medications</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {user.id}
                    </span>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(user)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-sky-50 transition"
                    title={t.edit}
                  >
                    <Edit3 size={15} />
                  </button>
                  {users.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(user.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 transition"
                      title={t.delete}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Select Profile button */}
              {!isActive && (
                <button
                  type="button"
                  onClick={() => onSelectUser(user.id)}
                  className="mt-3.5 w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-sky-50/70 hover:bg-sky-100 hover:text-slate-800 transition cursor-pointer"
                >
                  {t.switchUser}
                </button>
              )}

              {/* Delete Confirmation Overlay */}
              {isDeleting && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-20 flex flex-col justify-between p-4 animate-fade-in text-xs border border-rose-200 rounded-3xl">
                  <div className="text-rose-700 flex items-start gap-2">
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-rose-500" />
                    <span>{t.deleteUserWarning}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteUser(user.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Switch to "All Profiles" view */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onSelectUser('all')}
          className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeUserId === 'all'
              ? 'bg-sky-100 border-sky-300 text-sky-800 shadow-xs'
              : 'bg-white border-sky-100 text-slate-600 hover:text-slate-900 hover:bg-sky-50'
          }`}
        >
          <span>👁️ View All Profiles Combined (Family / Caregiver View)</span>
        </button>
      </div>

      {/* Create / Edit User Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl relative text-slate-800">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? t.editUser : t.createUser}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Photo / Avatar Preview */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-300 shadow-sm"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-sm bg-sky-500"
                    >
                      {userName ? userName.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}

                  <label className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white cursor-pointer shadow-md transition shadow-sky-200">
                    <Camera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[11px] text-slate-500 mt-2">
                  Tap camera to upload custom photo
                </span>
              </div>

              {/* User Name input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.userName} *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={t.enterUserName}
                  autoFocus
                  required
                  className="w-full bg-sky-50/60 text-slate-900 text-sm px-3.5 py-2.5 rounded-xl border border-sky-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-xs shadow-sky-200"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
