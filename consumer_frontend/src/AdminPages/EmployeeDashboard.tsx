import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEdit2, FiTrash2, FiMail, FiUserPlus, FiX, FiCheck, FiUser } from 'react-icons/fi';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Tooltip from '@/components/Tooltip';
import { HiArrowPath } from 'react-icons/hi2';

interface Member {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  organization: string;
  status: string;
  user_name: string;
}

interface Invite {
  email: string;
  organization: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
};

const roleColors: Record<string, string> = {
  OW: 'bg-purple-100 text-purple-800',
  AD: 'bg-blue-100 text-blue-800',
  EM: 'bg-gray-100 text-gray-800',
};

const MemberTable = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isMemberActionFormOpen, setIsMemberActionFormOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/organization`, {
          withCredentials: true,
        });
        setMembers(response.data.members);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError('Failed to load members. Please try again later.');
        toast.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleDeleteMember = async (member: Member) => {
    confirmAlert({
      title: 'Confirm Removal',
      message: `Are you sure you want to remove ${member.first_name} ${member.last_name}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/member`, {
                withCredentials: true,
                data: { member_username: member.user_name }
              });
              setMembers(members.filter(m => m.user_name !== member.user_name));
              toast.success('Member removed successfully');
            } catch (err) {
              console.error("Error removing member:", err);
              toast.error('Failed to remove member');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleShowForm = (member: Member) => {
    setSelectedMember(member);
    setIsMemberActionFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsMemberActionFormOpen(false);
    setSelectedMember(null);
  };

  if (loading) {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-indigo-50/75">
        <div className="animate-pulse" style={{ width: "50px", height: "50px" }}>
          <img src="/minilogo.png" alt="logo" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-tertiary rounded-xl shadow-md border border-gray-200 overflow-x-auto">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Team Members</h2>

        
        <Tooltip label="Delete the invite." aria-label="Delete the invite.">
            <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-button-hover transition-colors"
            >
            <FiUserPlus className="mr-2" />
            Invite
            </button>
        </Tooltip>
      </div>
      
      {members.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No team members found. Invite members to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-tertiary-light/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-tertiary-light/5 divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.user_name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                        <div className="text-sm text-gray-500">@{member.user_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[member.role] || 'bg-gray-100 text-gray-800'}`}>
                      {member.role === 'OW' ? 'Owner' : member.role === 'AD' ? 'Admin' : 'Employee'}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[member.status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                      {member.status}
                    </span>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleShowForm(member)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Remove"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MemberActionForm 
        isOpen={isMemberActionFormOpen} 
        onClose={handleCloseForm} 
        member={selectedMember} 
        setMembers={setMembers}
      />

      <InvitationsModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
};

interface MemberActionFormProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const MemberActionForm: React.FC<MemberActionFormProps> = ({ isOpen, onClose, member, setMembers }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedRole, setSelectedRole] = useState(member?.role || 'EM');
  const { user } = useAuth();

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (formRef.current && !formRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (!member || newRole === member.role) return;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/member/`, {
        member_username: member.user_name,
        role: newRole
      }, { withCredentials: true });

      setMembers(prev => prev.map(m => 
        m.user_name === member.user_name ? { ...m, role: newRole } : m
      ));
      toast.success('Role updated successfully');
      onClose();
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error('Failed to update role');
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative"
        ref={formRef}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Manage {member.first_name}'s Role</h2>
        <button onClick={()=>console.log(selectedRole)}>Look!</button>
        
        <div className="space-y-3">
          {(user?.role === 'OW' && member.role !== 'OW') && (
            <button
              onClick={() => setSelectedRole('AD')}
              className={`w-full text-left p-3 rounded-lg border ${selectedRole === 'AD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full border-2 mr-3 ${selectedRole === 'AD' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}></div>
                <div>
                  <p className="font-medium">Administrator</p>
                  <p className="text-sm text-gray-500">Can manage members and content</p>
                </div>
              </div>
            </button>
          )}

          {(user?.role === 'OW' || (user?.role === 'AD' && member.role !== 'OW' && member.role !== 'AD')) && (
            <button
            onClick={() => setSelectedRole('EM')}
              className={`w-full text-left p-3 rounded-lg border ${selectedRole === 'EM' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full border-2 mr-3 ${selectedRole === 'EM' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}></div>
                <div>
                  <p className="font-medium">Employee</p>
                  <p className="text-sm text-gray-500">Can access assigned content</p>
                </div>
              </div>
            </button>
          )}

          {member.role === 'OW' && (
            <div className="p-3 rounded-lg bg-gray-100">
              <p className="font-medium">Owner</p>
              <p className="text-sm text-gray-500">Full organization permissions</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          {selectedRole !== member.role && (
            <button
              onClick={() => handleRoleChange(selectedRole)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface InvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvitationsModal: React.FC<InvitationsModalProps> = ({ isOpen, onClose }) => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/invite/`, {
          withCredentials: true,
        });
        setInvites(response.data.invites);
      } catch (err) {
        console.error("Error fetching invites:", err);
        setError('Failed to load invitations. Please try again later.');
        toast.error('Failed to load invitations');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchInvites();
  }, [isOpen]);

  const handleDeleteInvite = async (email: string) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete invitation to ${email}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/invite/`, {
                withCredentials: true,
                data: { email }
              });
              setInvites(invites.filter(i => i.email !== email));
              toast.success('Invitation deleted successfully');
            } catch (err) {
              console.error("Error deleting invitation:", err);
              toast.error('Failed to delete invitation');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleResendInvite = async (email: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/invite/`, {
        email
      }, { withCredentials: true });
      toast.success(`Invitation resent to ${email}`);
    } catch (err) {
      console.error("Error resending invitation:", err);
      toast.error(`Failed to resend invitation to ${email}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-tertiary rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Invitations</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">{invites.length} pending invitations</p>
          
          <Tooltip label="Send an invite." aria-label="Send the invite.">
            <button
                onClick={() => setIsCreateFormOpen(true)}
                className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-button-hover transition-colors"
            >
                <FiMail className="mr-2" />
                Send Invitation
            </button>
          </Tooltip>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse" style={{ width: "50px", height: "50px" }}>
              <img src="/minilogo.png" alt="logo" />
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : invites.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No pending invitations
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-tertiary-light/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-tertiary-light/5 divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invite.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Tooltip label="Resend the invite." aria-label="Resend the invite.">
                            <button
                            onClick={() => handleResendInvite(invite.email)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Resend"
                            >
                            <HiArrowPath size={18} />
                            </button>
                        </Tooltip>
                        <Tooltip label="Delete the invite." aria-label="Delete the invite.">
                            <button
                            onClick={() => handleDeleteInvite(invite.email)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                            >
                            <FiTrash2 size={18} />
                            </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <CreateInviteForm 
          isOpen={isCreateFormOpen} 
          onClose={() => setIsCreateFormOpen(false)} 
          setInvites={setInvites}
        />
      </div>
    </div>
  );
};

interface CreateInviteFormProps {
  isOpen: boolean;
  onClose: () => void;
  setInvites: React.Dispatch<React.SetStateAction<Invite[]>>;
}

const CreateInviteForm: React.FC<CreateInviteFormProps> = ({ isOpen, onClose, setInvites }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/invite/`, {
            email
        }, { withCredentials: true });

      
        console.log("Invite response:", response.data); 
        setInvites(prev => [...prev, response.data]);
        toast.success(`Invitation sent to ${email}`);
        setEmail('');
        onClose();
    } catch (err) {
        console.error("Error sending invitation:", err);
        setError(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (formRef.current && !formRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div
        className="bg-tertiary rounded-lg p-6 w-full max-w-md shadow-lg relative"
        ref={formRef}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Invite New Member</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="member@example.com"
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Tooltip label="Cancel." aria-label="Cancel.">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                Cancel
                </button>
            </Tooltip>
            <Tooltip label="Send the invite." aria-label="Send the invite.">
                <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-button-hover"
                >
                Send
                </button>
            </Tooltip>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-indigo-50/75">
        <div className="animate-pulse" style={{ width: "50px", height: "50px" }}>
          <img src="/minilogo.png" alt="logo" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center mb-12">
                <div className="w-40 h-40 rounded-full mx-auto mb-6 overflow-hidden">
                    <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover shadow-lg" />
                </div>
                <h2 className="text-4xl font-bold mb-6 text-tertiary">Employee Dashboard</h2>
                <p className="text-xl text-tertiary-light">Look over your current employes or invite new ones to your organization.</p>
            </div>
            <MemberTable />
        </div>
    </div>
  );
};

export default EmployeeDashboard;