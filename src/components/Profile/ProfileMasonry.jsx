import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { auth, db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import {
  ChatBubbleBottomCenterTextIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  ChartBarIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import UserInfoCard from './UserInfoCard';
import StatCard from './StatCard';
import AchievementCard from './AchievementCard';
import HallOfFameCard from './HallOfFameCard';
import '../ProfileStyles.css';

const MotionBox = motion(Box);

const ProfileMasonry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalHallOfFame: 0,
    streak: 0,
  });
  const [achievements, setAchievements] = useState([]);
  const [hallOfFamePosts, setHallOfFamePosts] = useState([]);

  const breakpointColumns = {
    default: 3,
    1100: 2,
    700: 1,
  };

  const mockStats = {
    totalPosts: 42,
    totalHallOfFame: 10,
    streak: 5,
  };

  const mockAchievements = [
    { id: 1, name: '初投稿', icon: ChatBubbleBottomCenterTextIcon },
    { id: 2, name: '殿堂入り', icon: StarIcon },
    { id: 3, name: '3日連続投稿', icon: FireIcon },
    { id: 4, name: '人気者', icon: HeartIcon },
    { id: 5, name: 'トレンド入り', icon: ChartBarIcon },
    { id: 6, name: '完璧な回答', icon: CheckBadgeIcon },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserData = async (uid) => {
    try {
      // Stats取得
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const hallOfFameQuery = query(
        collection(db, 'posts'),
        where('userId', '==', uid),
        where('isHallOfFame', '==', true)
      );
      const streakQuery = query(
        collection(db, 'userStats'),
        where('userId', '==', uid)
      );

      // Achievement取得
      const achievementsQuery = query(
        collection(db, 'achievements'),
        where('userId', '==', uid)
      );

      const [
        postsSnapshot,
        hallOfFameSnapshot,
        streakSnapshot,
        achievementsSnapshot,
      ] = await Promise.all([
        getDocs(postsQuery),
        getDocs(hallOfFameQuery),
        getDocs(streakQuery),
        getDocs(achievementsQuery),
      ]);

      setUserStats({
        totalPosts: postsSnapshot.size,
        totalHallOfFame: hallOfFameSnapshot.size,
        streak: streakSnapshot.docs[0]?.data()?.currentStreak || 0,
      });

      setAchievements(
        achievementsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      setHallOfFamePosts(
        hallOfFameSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center" color="white">
        Loading...
      </Box>
    );
  }

  return (
    <Box p={6} bg="#121212" minH="100vh" pt="120px">
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        <UserInfoCard user={user} />
        <StatCard stats={mockStats} />
        <AchievementCard achievements={mockAchievements} />
        {hallOfFamePosts.map((post) => (
          <HallOfFameCard key={post.id} post={post} />
        ))}
      </Masonry>
    </Box>
  );
};

export default ProfileMasonry;