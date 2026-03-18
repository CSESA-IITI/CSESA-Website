import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import authService from "../services/authService";
import skillService, { Skill } from "../services/skillService";
import LoadingSpinner from "../components/LoadingSpinner";
import CreateUserModal from "../components/CreateUserModal";

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    github_link: "",
    linkedin_link: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Skills management state
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        github_link: user.github_link || "",
        linkedin_link: user.linkedin_link || "",
      });
      setImagePreview(user.image_url || "");
      setUserSkills(user.skills?.map((skill) => skill.name) || []);
    }
  }, [user]);

  // Load available skills
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skills = await skillService.getAllSkills();
        setAvailableSkills(skills);
      } catch (error) {
        console.error("Failed to load skills:", error);
      }
    };
    loadSkills();
  }, []);

  const canCreateUsers = user?.role === "PRESIDENT" || user?.role === "HEAD";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          type: "error",
          title: "File Too Large",
          message: "Please select an image smaller than 5MB.",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        addToast({
          type: "error",
          title: "Invalid File Type",
          message: "Please select a valid image file.",
        });
        return;
      }

      setProfileImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (
      formData.github_link &&
      !formData.github_link.match(/^https?:\/\/(www\.)?github\.com\/.+/)
    ) {
      newErrors.github_link = "Please enter a valid GitHub URL";
    }

    if (
      formData.linkedin_link &&
      !formData.linkedin_link.match(/^https?:\/\/(www\.)?linkedin\.com\/.+/)
    ) {
      newErrors.linkedin_link = "Please enter a valid LinkedIn URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      if (profileImage) {
        submitData.append("image", profileImage);
      }

      // Add skills to the form data
      submitData.append("skill_names", JSON.stringify(userSkills));

      const updatedUser = await authService.updateProfile(submitData);
      setUser(updatedUser);
      setIsEditing(false);
      setProfileImage(null);

      addToast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      addToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Skills management functions
  const handleAddSkill = () => {
    const skillName = newSkill.trim();
    if (skillName && !userSkills.includes(skillName)) {
      setUserSkills((prev) => [...prev, skillName]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setUserSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillSelect = (skillName: string) => {
    if (!userSkills.includes(skillName)) {
      setUserSkills((prev) => [...prev, skillName]);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        github_link: user.github_link || "",
        linkedin_link: user.linkedin_link || "",
      });
      setImagePreview(user.image_url || "");
      setProfileImage(null);
      setUserSkills(user.skills?.map((skill) => skill.name) || []);
      setNewSkill("");
      setErrors({});
    }
    setIsEditing(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading profile..." />
      </div>
    );
  }

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-32 overflow-hidden">
      {/* Background Effects */}
      <motion.div
        className="absolute top-24 right-24 w-96 h-96 rounded-full bg-blue-500 opacity-20 filter blur-xl"
        animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-24 left-24 w-64 h-64 rounded-full bg-cyan-400 opacity-15 filter blur-xl"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-400 opacity-10 filter blur-2xl"
        animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-full border border-blue-400/30 text-blue-300 text-base font-mono mb-4">
            &lt;PROFILE_MANAGEMENT/&gt;
          </span>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your Profile
          </h1>
        </motion.div>

        {canCreateUsers && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateUserModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-blue-500/25"
            >
              <span>+</span>
              Create New User
            </motion.button>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-white/5 to-blue-500/5 border border-blue-400/20 rounded-2xl p-8 backdrop-blur-md shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-xl">
                    <img
                      src={imagePreview || "/default.jpg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/default.jpg";
                      }}
                    />
                  </div>

                  {isEditing && (
                    <motion.label
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <span className="text-white text-xl">📷</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </motion.label>
                  )}
                </div>

                {/* User Info */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-white">
                    {user.first_name} {user.last_name}
                  </h2>

                  {/* Role and Domain Badges */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-full">
                      <span className="text-blue-300 font-medium text-sm">
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </div>

                    {user.domain && (
                      <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-400/30 rounded-full">
                        <span className="text-cyan-300 font-medium text-sm">
                          {user.domain
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-center">
                    <p className="text-gray-300 text-sm">{user.email}</p>
                    {user.year && (
                      <p className="text-gray-400 text-sm">
                        Class of {user.year}
                      </p>
                    )}
                    {user.bio && (
                      <p className="text-gray-300 text-sm mt-3 italic max-w-xs mx-auto">
                        "{user.bio}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(user.github_link || user.linkedin_link) && (
                  <div className="flex justify-center gap-4 mt-6">
                    {user.github_link && (
                      <motion.a
                        whileHover={{ scale: 1.1, y: -2 }}
                        href={user.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-gray-500/25"
                      >
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </motion.a>
                    )}
                    {user.linkedin_link && (
                      <motion.a
                        whileHover={{ scale: 1.1, y: -2 }}
                        href={user.linkedin_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                      >
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </motion.a>
                    )}
                  </div>
                )}

                {/* Skills Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Skills
                  </h4>
                  {userSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userSkills.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No skills added yet. Edit your profile to add skills.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Profile Form Section */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Profile Information
                </h3>
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isLoading && <LoadingSpinner size="sm" />}
                      Save Changes
                    </motion.button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-white mb-2 font-medium"
                    >
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                        errors.first_name ? "border-red-500" : "border-gray-700"
                      } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                        !isEditing ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-white mb-2 font-medium"
                    >
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                        errors.last_name ? "border-red-500" : "border-gray-700"
                      } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                        !isEditing ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-white mb-2 font-medium"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full p-3 rounded-lg bg-gray-800/50 backdrop-blur-sm text-white border border-blue-400/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 outline-none transition-all duration-300 resize-vertical ${
                      !isEditing
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-blue-400/50"
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Role, Domain, and Year (Read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-medium">
                      Role{" "}
                      <span className="text-gray-400 text-sm">
                        (Set by President)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={user?.role?.replace(/_/g, " ") || "Not assigned"}
                      disabled={true}
                      className="w-full p-3 rounded-lg bg-gray-800/30 backdrop-blur-sm text-gray-400 border border-gray-600/30 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">
                      Domain{" "}
                      <span className="text-gray-400 text-sm">
                        (Set by President)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={
                        user?.domain
                          ?.replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                        "Not assigned"
                      }
                      disabled={true}
                      className="w-full p-3 rounded-lg bg-gray-800/30 backdrop-blur-sm text-gray-400 border border-gray-600/30 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">
                      Graduation Year{" "}
                      <span className="text-gray-400 text-sm">
                        (Set by President)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={user?.year || "Not assigned"}
                      disabled={true}
                      className="w-full p-3 rounded-lg bg-gray-800/30 backdrop-blur-sm text-gray-400 border border-gray-600/30 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-white mb-2 font-medium"
                  >
                    Email{" "}
                    <span className="text-gray-400 text-sm">(Read-only)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user?.email || ""}
                    disabled={true}
                    className="w-full p-3 rounded-lg bg-gray-800/30 backdrop-blur-sm text-gray-400 border border-gray-600/30 cursor-not-allowed"
                    placeholder="Email cannot be changed"
                  />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="github_link"
                      className="block text-white mb-2 font-medium"
                    >
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      id="github_link"
                      name="github_link"
                      value={formData.github_link}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                        errors.github_link
                          ? "border-red-500"
                          : "border-gray-700"
                      } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                        !isEditing ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      placeholder="https://github.com/username"
                    />
                    {errors.github_link && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.github_link}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="linkedin_link"
                      className="block text-white mb-2 font-medium"
                    >
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      id="linkedin_link"
                      name="linkedin_link"
                      value={formData.linkedin_link}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                        errors.linkedin_link
                          ? "border-red-500"
                          : "border-gray-700"
                      } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                        !isEditing ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      placeholder="https://linkedin.com/in/username"
                    />
                    {errors.linkedin_link && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.linkedin_link}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills Management */}
                <div>
                  <label className="block text-white mb-2 font-medium">
                    Skills & Expertise
                  </label>

                  {/* Current Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {userSkills.map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                        >
                          <span>{skill}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-red-400 hover:text-red-300 ml-1 text-xs"
                            >
                              ×
                            </button>
                          )}
                        </motion.div>
                      ))}
                      {userSkills.length === 0 && (
                        <p className="text-gray-400 text-sm">
                          No skills added yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Add New Skill */}
                  {isEditing && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddSkill())
                          }
                          className="flex-1 p-3 rounded-lg bg-gray-800/50 backdrop-blur-sm text-white border border-blue-400/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 outline-none transition-all duration-300"
                          placeholder="Add a new skill..."
                        />
                        <motion.button
                          type="button"
                          onClick={handleAddSkill}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-300 font-medium"
                        >
                          Add
                        </motion.button>
                      </div>

                      {/* Suggested Skills */}
                      {availableSkills.length > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">
                            Suggested skills:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {availableSkills
                              .filter(
                                (skill) => !userSkills.includes(skill.name)
                              )
                              .slice(0, 10)
                              .map((skill, index) => (
                                <motion.button
                                  key={index}
                                  type="button"
                                  onClick={() => handleSkillSelect(skill.name)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-3 py-1 bg-gray-700/50 hover:bg-blue-600/30 text-gray-300 hover:text-blue-300 rounded-full text-sm border border-gray-600/30 hover:border-blue-500/30 transition-all duration-300"
                                >
                                  + {skill.name}
                                </motion.button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
      />
    </section>
  );
};

export default Profile;
