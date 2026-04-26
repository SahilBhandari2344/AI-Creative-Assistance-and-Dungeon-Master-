'use client';

import { useState } from 'react';
import { Sword, Shield, Scroll, Sparkles, Play, BookOpen, Users, Dice6, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Dungeon Master',
      description: 'Experience dynamic storytelling with an AI DM that adapts to your choices and creates unique adventures.',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Companion Party System',
      description: 'Travel with AI companions who have unique personalities, react to your decisions, and shape the story.',
      color: 'blue'
    },
    {
      icon: Dice6,
      title: 'Classic D&D Mechanics',
      description: 'Full character creation with races, classes, stats, skills, and dice rolling. Pure 5e experience.',
      color: 'red'
    },
    {
      icon: Scroll,
      title: 'Rich Character Backgrounds',
      description: 'Create detailed backstories with AI assistance or write your own. Your story matters.',
      color: 'amber'
    },
    {
      icon: BookOpen,
      title: 'Branching Narratives',
      description: 'Every choice matters. Multiple paths, consequences, and outcomes based on your decisions.',
      color: 'green'
    },
    {
      icon: Shield,
      title: 'Combat & Exploration',
      description: 'Engage in tactical combat, explore dungeons, and interact with a living, breathing world.',
      color: 'stone'
    }
  ];

  const howToPlay = [
    {
      step: 1,
      title: 'Create Your Hero',
      description: 'Choose your race, class, and stats. Customize your character with skills, traits, and flaws.',
      icon: '⚔️'
    },
    {
      step: 2,
      title: 'Build Your Party',
      description: 'Select or customize three AI companions with unique personalities and classes.',
      icon: '👥'
    },
    {
      step: 3,
      title: 'Begin Your Adventure',
      description: 'The AI Dungeon Master sets the scene. Read the story and make your choices.',
      icon: '📖'
    },
    {
      step: 4,
      title: 'Make Decisions',
      description: 'Choose actions, roll dice for skill checks, and watch the story unfold based on your choices.',
      icon: '🎲'
    },
    {
      step: 5,
      title: 'Shape Your Destiny',
      description: 'Your decisions, dice rolls, and character traits influence the narrative and outcomes.',
      icon: '✨'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(/table-background2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo/Title */}
              <div className="mb-8 flex items-center justify-center gap-4">
                <Sword className="w-12 h-12 text-amber-500" />
                <h1 className="text-6xl md:text-8xl font-serif font-bold text-amber-500 drop-shadow-lg">
                  D&D Solo Adventure
                </h1>
                <Shield className="w-12 h-12 text-amber-500" />
              </div>

              {/* Tagline */}
              <p className="text-2xl md:text-3xl font-serif text-stone-300 mb-4">
                Your Personal AI Dungeon Master
              </p>
              <p className="text-lg md:text-xl text-stone-400 mb-12 max-w-3xl mx-auto font-serif italic">
                Experience epic solo D&D adventures powered by AI. Create your hero, gather your party, 
                and embark on a journey where every choice shapes your destiny.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <motion.button
                  onClick={() => router.push('/character-creator')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold text-xl px-8 py-4 rounded-lg border-2 border-amber-900 shadow-2xl transition-all flex items-center gap-3"
                >
                  <Play className="w-6 h-6" />
                  Start Your Adventure
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>


              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 text-stone-400 text-sm font-serif">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>AI-Powered DM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Full Character Creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Save & Load Progress</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-stone-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-serif font-bold text-amber-500 mb-4">
                Features
              </h2>
              <p className="text-xl text-stone-300 font-serif italic">
                Everything you need for an epic solo D&D experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const colorClasses = {
                  purple: 'from-purple-600 to-purple-700 border-purple-800',
                  blue: 'from-blue-600 to-blue-700 border-blue-800',
                  red: 'from-red-600 to-red-700 border-red-800',
                  amber: 'from-amber-600 to-amber-700 border-amber-800',
                  green: 'from-green-600 to-green-700 border-green-800',
                  stone: 'from-stone-600 to-stone-700 border-stone-800'
                };

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onHoverStart={() => setHoveredFeature(index)}
                    onHoverEnd={() => setHoveredFeature(null)}
                    whileHover={{ scale: 1.05 }}
                    className="bg-stone-900/50 backdrop-blur-sm border-2 border-stone-700 rounded-lg p-6 hover:border-amber-500 transition-all shadow-xl"
                  >
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} border-2 flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-amber-500 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-stone-300 font-serif leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How to Play Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-serif font-bold text-amber-500 mb-4">
                How to Play
              </h2>
              <p className="text-xl text-stone-300 font-serif italic">
                Your journey begins in 5 simple steps
              </p>
            </motion.div>

            <div className="space-y-6">
              {howToPlay.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-stone-900/50 backdrop-blur-sm border-2 border-stone-700 hover:border-amber-500 rounded-lg p-6 transition-all shadow-xl"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-700 border-2 border-amber-800 rounded-full flex items-center justify-center text-3xl shadow-lg">
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-amber-500 font-serif">
                          STEP {step.step}
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-amber-500 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-stone-300 font-serif text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack / About Section */}
        <section className="py-20 px-4 bg-stone-800/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-5xl font-serif font-bold text-amber-500 mb-4">
                About This Project
              </h2>
            </motion.div>

            <div className="bg-stone-900/50 backdrop-blur-sm border-2 border-stone-700 rounded-lg p-8 shadow-xl">
              <p className="text-stone-300 font-serif text-lg leading-relaxed mb-6">
                <strong className="text-amber-500">D&D Solo Adventure</strong> is a free, open-source 
                web application that brings the magic of Dungeons & Dragons to solo players. Powered by 
                AI, it acts as your personal Dungeon Master, creating dynamic stories that adapt to your 
                choices.
              </p>
              
              <p className="text-stone-300 font-serif text-lg leading-relaxed mb-6">
                Whether you're a seasoned adventurer or new to D&D, this tool provides a complete tabletop 
                RPG experience with character creation, companion management, dice rolling, and branching 
                narratives—all without needing a group.
              </p>

              <div className="border-t-2 border-stone-700 pt-6 mt-6">
                <h3 className="text-2xl font-serif font-bold text-amber-500 mb-4">
                  Built With
                </h3>
                <div className="flex flex-wrap gap-3">
                  {['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Framer Motion', 'AI API'].map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-stone-800 border-2 border-stone-600 rounded-lg font-serif text-stone-300 text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>


            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl font-serif font-bold text-amber-500 mb-6">
                Ready to Begin Your Quest?
              </h2>
              <p className="text-xl text-stone-300 font-serif italic mb-8">
                Your adventure awaits. Roll for initiative.
              </p>
              <motion.button
                onClick={() => router.push('/character-creator')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold text-2xl px-12 py-5 rounded-lg border-2 border-amber-900 shadow-2xl transition-all flex items-center gap-3 mx-auto"
              >
                <Dice6 className="w-7 h-7" />
                Start Adventure
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t-2 border-stone-800">
          <div className="max-w-6xl mx-auto text-center text-stone-500 font-serif text-sm">
            <p className="mb-2">
              Made with ⚔️ for D&D enthusiasts everywhere
            </p>
            <p>
              This is a fan project and is not affiliated with Wizards of the Coast or Dungeons & Dragons
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}