// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { LogIn, UserPlus, Mail, Lock, User } from "lucide-react";
// import api from "../lib/axios.js";
// import { useAuth } from "../contexts/AuthContext.jsx";
// import { useBranches } from "../hooks/useSyllabus.js";
// import { Button } from "../components/ui/Button.jsx";
// import Input from "../components/ui/Input.jsx";
// import Select, { SelectItem } from "../components/ui/Select.jsx";
// import { cn } from "../lib/utils.js";

// export default function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const { data: branches = [] } = useBranches();
//   const [tab, setTab] = useState("login");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");

//   const [regName, setRegName] = useState("");
//   const [regEmail, setRegEmail] = useState("");
//   const [regPassword, setRegPassword] = useState("");
//   const [regConfirmPassword, setRegConfirmPassword] = useState("");
//   const [regYear, setRegYear] = useState("");
//   const [regBranchId, setRegBranchId] = useState("");

//   const demoAccounts = [
//     {
//       name: "Student Account",
//       email: "aarav.mehta@peerlearn.edu",
//       password: "student123456",
//     },
//     {
//       name: "Moderator Account",
//       email: "moderator@peerlearn.edu",
//       password: "123456789",
//     },
//     {
//       name: "Admin Account",
//       email: "admin@peerlearn.edu",
//       password: "789456123",
//     },
//   ];

//   const fillDemoAccount = (email, password) => {
//     setLoginEmail(email);
//     setLoginPassword(password);
//     setError("");
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const res = await api.post("/auth/login", {
//         email: loginEmail.trim(),
//         password: loginPassword,
//       });
//       const userData = res.data?.data;
//       if (!userData) throw new Error("Invalid response");
//       login(userData);
//       navigate("/browse", { replace: true });
//     } catch (err) {
//       const message =
//         err.response?.data?.message ||
//         err.message ||
//         "Invalid email or password.";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError("");
//     if (regPassword !== regConfirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }
//     if (regPassword.length < 6) {
//       setError("Password must be at least 6 characters.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await api.post("/auth/register", {
//         name: regName.trim(),
//         email: regEmail.trim(),
//         password: regPassword,
//         year: regYear ? Number(regYear) : undefined,
//         branch_id: regBranchId || undefined,
//       });
//       const userData = res.data?.data;
//       if (!userData) throw new Error("Invalid response");
//       login(userData);
//       navigate("/browse", { replace: true });
//     } catch (err) {
//       const message =
//         err.response?.data?.message ||
//         err.message ||
//         "Registration failed. Please try again.";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
//       <div className="w-full max-w-md">
//         <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] overflow-hidden">
//           <div className="border-b border-[var(--border-default)] p-2 flex">
//             <button
//               type="button"
//               onClick={() => {
//                 setTab("login");
//                 setError("");
//               }}
//               className={cn(
//                 "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors",
//                 tab === "login"
//                   ? "bg-[var(--accent)] text-white"
//                   : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
//               )}
//             >
//               <LogIn className="h-4 w-4" />
//               Login
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 setTab("register");
//                 setError("");
//               }}
//               className={cn(
//                 "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors",
//                 tab === "register"
//                   ? "bg-[var(--accent)] text-white"
//                   : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
//               )}
//             >
//               <UserPlus className="h-4 w-4" />
//               Register
//             </button>
//           </div>

//           <div className="p-6">
//             {error && (
//               <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
//                 {error}
//               </div>
//             )}

//             {tab === "login" ? (
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <Input
//                   label="Email"
//                   type="email"
//                   autoComplete="email"
//                   value={loginEmail}
//                   onChange={(e) => setLoginEmail(e.target.value)}
//                   leftIcon={<Mail className="h-4 w-4" />}
//                   placeholder="you@example.com"
//                   required
//                 />
//                 <Input
//                   label="Password"
//                   type="password"
//                   autoComplete="current-password"
//                   value={loginPassword}
//                   onChange={(e) => setLoginPassword(e.target.value)}
//                   leftIcon={<Lock className="h-4 w-4" />}
//                   placeholder="••••••••"
//                   required
//                 />
//                 <Button
//                   type="submit"
//                   variant="primary"
//                   className="w-full"
//                   loading={loading}
//                   disabled={loading}
//                 >
//                   Log in
//                 </Button>

//                 <div className="mt-6 space-y-2">
//                   <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
//                     Demo Accounts
//                   </p>
//                   <div className="space-y-2">
//                     {demoAccounts.map((account, idx) => (
//                       <button
//                         key={idx}
//                         type="button"
//                         onClick={() => fillDemoAccount(account.email, account.password)}
//                         className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-hover)] px-3 py-2 text-left text-xs hover:bg-[var(--accent)]/10 transition-colors"
//                       >
//                         <div className="font-semibold text-[var(--text-primary)]">
//                           {account.name}
//                         </div>
//                         <div className="text-[var(--text-muted)] text-xs">
//                           {account.email}
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </form>
//             ) : (
//               <form onSubmit={handleRegister} className="space-y-4">
//                 <Input
//                   label="Full name"
//                   type="text"
//                   autoComplete="name"
//                   value={regName}
//                   onChange={(e) => setRegName(e.target.value)}
//                   leftIcon={<User className="h-4 w-4" />}
//                   placeholder="Your name"
//                   required
//                 />
//                 <Input
//                   label="Email"
//                   type="email"
//                   autoComplete="email"
//                   value={regEmail}
//                   onChange={(e) => setRegEmail(e.target.value)}
//                   leftIcon={<Mail className="h-4 w-4" />}
//                   placeholder="you@example.com"
//                   required
//                 />
//                 <Input
//                   label="Password"
//                   type="password"
//                   autoComplete="new-password"
//                   value={regPassword}
//                   onChange={(e) => setRegPassword(e.target.value)}
//                   leftIcon={<Lock className="h-4 w-4" />}
//                   placeholder="At least 6 characters"
//                   required
//                 />
//                 <Input
//                   label="Confirm password"
//                   type="password"
//                   autoComplete="new-password"
//                   value={regConfirmPassword}
//                   onChange={(e) => setRegConfirmPassword(e.target.value)}
//                   leftIcon={<Lock className="h-4 w-4" />}
//                   placeholder="Repeat password"
//                   required
//                 />
//                 <Select
//                   label="Year (optional)"
//                   placeholder="Select year"
//                   value={regYear}
//                   onValueChange={setRegYear}
//                 >
//                   <SelectItem value="1">1</SelectItem>
//                   <SelectItem value="2">2</SelectItem>
//                   <SelectItem value="3">3</SelectItem>
//                   <SelectItem value="4">4</SelectItem>
//                 </Select>
//                 <Select
//                   label="Branch (optional)"
//                   placeholder="Select branch"
//                   value={regBranchId}
//                   onValueChange={setRegBranchId}
//                 >
//                   {branches.map((b) => (
//                     <SelectItem key={b.id} value={b.id}>
//                       {b.code} — {b.name}
//                     </SelectItem>
//                   ))}
//                 </Select>
//                 <Button
//                   type="submit"
//                   variant="primary"
//                   className="w-full"
//                   loading={loading}
//                   disabled={loading}
//                 >
//                   Create account
//                 </Button>
//               </form>
//             )}
//           </div>
//         </div>
//         <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
//           PeerLearn — peer-to-peer learning
//         </p>
//       </div>
//     </div>
//   );
// }
