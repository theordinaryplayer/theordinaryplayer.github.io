import Link from "next/link"
import { ArrowRight, Github, Instagram, Globe, Linkedin } from "lucide-react"

// Mock data for team members
const members = [
  {
    id: 1,
    name: "Rosemary",
    role: "Team Lead",
    specialty: "Newbie",
    bio: "forced to solve sanity check in every ctf...",
    image: "https://media.tenor.com/_6oZOOOWKdwAAAAM/discord-pfp.gif",
    social: {
      github: "https://github.com/Rosemary1337",
      instagram: "https://instagram.com/ryhnmhrdkaa",
      website: "https://ros3mary.my.id",
      linkedin: "https://linkedin.com/in/rayhan-mahardika",
    },
  },
  {
    id: 2,
    name: "Frigg",
    role: "DFIR, OSINT",
    specialty: "Finding Information",
    bio: "From metadata to memory dumps, I hunt truth in digital noise.",
    image:
      "https://i.pinimg.com/originals/7f/6d/40/7f6d40a71587e5a14a829c36d608dd20.gif",
    social: {
      github: "https://github.com/Rafaa-kn",
      instagram: "https://instagram.com/rafaakn_",
      linkedin: "https://www.linkedin.com/in/rado-faristra-amsah-882bb8380/",
    },
  },
  {
    id: 3,
    name: "Inct1c3",
    role: "Reverse Engineering",
    specialty: "Binary Analysis",
    bio: "love sinta",
    image:
      "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyYWhwdzcwenA0YWY1a3Y1NzNlaWhqMzFzaHQ4bzhtbmF6dnM3NzJvbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/N4AIdLd0D2A9y/giphy.gif",
    social: {
      github: "https://github.com/SyafBaik",
      instagram: "https://instagram.com/wtf_syfz",
    },
  },
];

export default function MembersPage() {
  return (
    <div className="pt-12">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div>
          <h1 className="text-5xl md:text-7xl font-semibold mb-6 gradient-text">Our Team</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Meet the elite members of The Ordinary Player, dedicated to cybersecurity excellence
          </p>
        </div>
      </section>

      {/* Members Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              {/* Member Profile Image */}
              <div className="mb-4">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  width={64}
                  height={64}
                />
              </div>

              {/* Member Info */}
              <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {member.name}
              </h3>
              {member.aka && (
                <p className="text-muted-foreground text-sm mb-1">AKA: {member.aka}</p>
              )}
              <p className="text-primary font-semibold text-sm mb-3">{member.role}</p>

              {/* Specialty Badge */}
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block mb-4">
                {member.specialty}
              </span>

              {/* Bio */}
              <p className="text-muted-foreground text-sm">{member.bio}</p>
              
              {/* Social Media Links */}
              {member.social && (
                <div className="flex gap-3 mt-4">
                  {member.social.github && (
                    <Link
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github size={20} />
                    </Link>
                  )}
                  {member.social.instagram && (
                    <Link
                      href={member.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram size={20} />
                    </Link>
                  )}
                  {member.social.website && (
                    <Link
                      href={member.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe size={20} />
                    </Link>
                  )}
                  {member.social.linkedin && (
                    <Link
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin size={20} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
