import {
  Box,
  Heading,
  VStack,
  Text,
  SimpleGrid,
  Spinner,
  Badge,
  CardRoot as Card,
  CardBody,
  CardHeader,
  AlertRoot as Alert,
  AlertDescription,
  Field,
  Input,
  Button,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import useAdminDashboard from '../../../hooks/useAdminDashboard';
import useUserContext from '../../../hooks/useUserContext';
import { Navigate } from 'react-router-dom';
import UserManagementTab from './UserManagementTab';
import './index.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<'metrics' | 'users'>('metrics');
  const {
    metrics,
    loading,
    error,
    notificationMessage,
    setNotificationMessage,
    notificationStatus,
    handleNotificationSubmit,
  } = useAdminDashboard();

  // Check if user is admin
  const isAdmin = user.role === 'admin';

  if (!isAdmin) {
    return <Navigate to='/home' />;
  }

  if (loading) {
    return (
      <Box p={8} textAlign='center'>
        <Spinner size='xl' />
        <Text mt={4}>Loading dashboard metrics...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status='error'>{error}</Alert>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box p={8}>
        <Text>No metrics available</Text>
      </Box>
    );
  }

  // Prepare data for charts
  const userRoleData = [
    { name: 'Users', value: metrics.users.byRole.user },
    { name: 'Moderators', value: metrics.users.byRole.moderator },
    { name: 'Admins', value: metrics.users.byRole.admin },
  ];

  const contentBreakdown = [
    { name: 'Questions', value: metrics.content.questions.total },
    { name: 'Answers', value: metrics.content.answers.total },
    { name: 'Comments', value: metrics.content.comments.total },
  ];

  const moderationStatus = [
    { name: 'Pending Review', value: metrics.moderation.pendingReview },
    { name: 'Reviewed', value: metrics.moderation.totalReviewed },
    { name: 'Deleted', value: metrics.moderation.totalDeleted },
  ];

  return (
    <Box p={8}>
      <VStack align='stretch' gap={6}>
        <Box>
          <Heading size='lg' mb={2}>
            Admin Dashboard
          </Heading>
          <Text color='gray.600'>Comprehensive metrics and analytics for the platform</Text>
        </Box>

        {/* Tab Navigation */}
        <Box borderBottom='2px' borderColor='gray.200'>
          <SimpleGrid columns={2} gap={0} maxW='400px'>
            <Button
              variant={activeTab === 'metrics' ? 'solid' : 'ghost'}
              colorScheme={activeTab === 'metrics' ? 'blue' : 'gray'}
              borderRadius='0'
              borderBottom={activeTab === 'metrics' ? '3px solid' : 'none'}
              borderColor='blue.500'
              onClick={() => setActiveTab('metrics')}>
              Metrics
            </Button>
            <Button
              variant={activeTab === 'users' ? 'solid' : 'ghost'}
              colorScheme={activeTab === 'users' ? 'blue' : 'gray'}
              borderRadius='0'
              borderBottom={activeTab === 'users' ? '3px solid' : 'none'}
              borderColor='blue.500'
              onClick={() => setActiveTab('users')}>
              User Management
            </Button>
          </SimpleGrid>
        </Box>

        {/* Tab Content */}
        {activeTab === 'users' ? (
          <UserManagementTab />
        ) : (
          <>
            {/* Summary Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
              <Card>
                <CardHeader>
                  <Text fontSize='sm' color='gray.600'>
                    Total Users
                  </Text>
                </CardHeader>
                <CardBody>
                  <Heading size='xl'>{metrics.users.total}</Heading>
                  <Text fontSize='sm' color='gray.500'>
                    {metrics.users.newThisWeek} new this week
                  </Text>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontSize='sm' color='gray.600'>
                    Total Questions
                  </Text>
                </CardHeader>
                <CardBody>
                  <Heading size='xl'>{metrics.content.questions.total}</Heading>
                  <Text fontSize='sm' color='gray.500'>
                    {metrics.content.questions.unanswered} unanswered
                  </Text>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontSize='sm' color='gray.600'>
                    Total Views
                  </Text>
                </CardHeader>
                <CardBody>
                  <Heading size='xl'>{metrics.engagement.totalViews.toLocaleString()}</Heading>
                  <Text fontSize='sm' color='gray.500'>
                    Platform engagement
                  </Text>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontSize='sm' color='gray.600'>
                    Pending Review
                  </Text>
                </CardHeader>
                <CardBody>
                  <Heading size='xl'>{metrics.moderation.pendingReview}</Heading>
                  <Text fontSize='sm' color='gray.500'>
                    Flagged content
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Charts Row 1 */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
              <Card>
                <CardHeader>
                  <Heading size='md'>User Growth (Last 12 Weeks)</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={metrics.growth.usersByWeek}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='week' angle={-45} textAnchor='end' height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type='monotone' dataKey='count' stroke='#8884d8' name='New Users' />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size='md'>Question Growth (Last 12 Weeks)</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={metrics.growth.questionsByWeek}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='week' angle={-45} textAnchor='end' height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type='monotone' dataKey='count' stroke='#82ca9d' name='New Questions' />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Charts Row 2 */}
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
              <Card>
                <CardHeader>
                  <Heading size='md'>Users by Role</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width='100%' height={250}>
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'>
                        {userRoleData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size='md'>Content Breakdown</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width='100%' height={250}>
                    <BarChart data={contentBreakdown}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey='value' fill='#8884d8' />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size='md'>Moderation Status</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width='100%' height={250}>
                    <BarChart data={moderationStatus}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey='value' fill='#FF8042' />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Detailed Tables */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
              <Card>
                <CardHeader>
                  <Heading size='md'>User Statistics</Heading>
                </CardHeader>
                <CardBody>
                  <Box as='table' width='100%' borderCollapse='collapse'>
                    <Box as='tbody'>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Total Users
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.users.total}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          New This Week
                        </Box>
                        <Box as='td' p={2}>
                          <Badge colorScheme='green'>{metrics.users.newThisWeek}</Badge>
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          New This Month
                        </Box>
                        <Box as='td' p={2}>
                          <Badge colorScheme='blue'>{metrics.users.newThisMonth}</Badge>
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Active (Last 7 Days)
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.users.active}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Suspended
                        </Box>
                        <Box as='td' p={2}>
                          <Badge colorScheme='red'>{metrics.users.suspended}</Badge>
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Regular Users
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.users.byRole.user}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Moderators
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.users.byRole.moderator}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Admins
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.users.byRole.admin}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size='md'>Content Statistics</Heading>
                </CardHeader>
                <CardBody>
                  <Box as='table' width='100%' borderCollapse='collapse'>
                    <Box as='tbody'>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Total Questions
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.content.questions.total}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Questions with Answers
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.content.questions.withAnswers}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Unanswered
                        </Box>
                        <Box as='td' p={2}>
                          <Badge colorScheme='orange'>{metrics.content.questions.unanswered}</Badge>
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Flagged Questions
                        </Box>
                        <Box as='td' p={2}>
                          <Badge colorScheme='red'>{metrics.content.questions.flagged}</Badge>
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Total Answers
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.content.answers.total}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Total Comments
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.content.comments.total}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Avg Answers/Question
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.engagement.averageAnswersPerQuestion}
                        </Box>
                      </Box>
                      <Box as='tr'>
                        <Box as='td' fontWeight='bold' p={2}>
                          Avg Comments/Answer
                        </Box>
                        <Box as='td' p={2}>
                          {metrics.engagement.averageCommentsPerAnswer}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Most Used Tags Table */}
            <Card>
              <CardHeader>
                <Heading size='md'>Most Used Tags</Heading>
              </CardHeader>
              <CardBody>
                <Box as='table' width='100%' borderCollapse='collapse'>
                  <Box as='thead'>
                    <Box as='tr'>
                      <Box as='th' textAlign='left' p={2} borderBottom='1px' borderColor='gray.200'>
                        Tag Name
                      </Box>
                      <Box
                        as='th'
                        textAlign='right'
                        p={2}
                        borderBottom='1px'
                        borderColor='gray.200'>
                        Usage Count
                      </Box>
                    </Box>
                  </Box>
                  <Box as='tbody'>
                    {metrics.tags.mostUsed.length > 0 ? (
                      metrics.tags.mostUsed.map(tag => (
                        <Box as='tr' key={tag.name}>
                          <Box as='td' p={2}>
                            <Badge colorScheme='blue'>{tag.name}</Badge>
                          </Box>
                          <Box as='td' textAlign='right' p={2}>
                            {tag.count}
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box as='tr'>
                        <Box as='td' textAlign='center' p={4}>
                          No tags available
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardBody>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <Heading size='md'>Engagement Metrics</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  <Box>
                    <Text fontSize='sm' color='gray.600'>
                      Total Views
                    </Text>
                    <Heading size='lg'>{metrics.engagement.totalViews.toLocaleString()}</Heading>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.600'>
                      Total Upvotes
                    </Text>
                    <Heading size='lg'>{metrics.engagement.totalUpvotes.toLocaleString()}</Heading>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.600'>
                      Total Downvotes
                    </Text>
                    <Heading size='lg'>
                      {metrics.engagement.totalDownvotes.toLocaleString()}
                    </Heading>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Additional Statistics */}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <Card>
                <CardHeader>
                  <Text fontSize='sm' color='gray.600'>
                    Communities
                  </Text>
                </CardHeader>
                <CardBody>
                  <Heading size='lg'>{metrics.communities.total}</Heading>
                  <Text fontSize='sm' color='gray.500'>
                    {metrics.communities.public} public, {metrics.communities.private} private
                  </Text>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontSize='sm' color='gray.600'>
                    Collections
                  </Text>
                </CardHeader>
                <CardBody>
                  <Heading size='lg'>{metrics.collections.total}</Heading>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontSize='sm' color='gray.600'>
                    Messages
                  </Text>
                </CardHeader>
                <CardBody>
                  <Heading size='lg'>{metrics.messages.total}</Heading>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* System Notification Section */}
            <Box className='system-notification-section'>
              <Heading className='system-notification-title'>Send System-Wide Notification</Heading>
              <Field.Root>
                <Field.Label>Notification Message</Field.Label>
                <Input
                  placeholder='Enter notification text for all users...'
                  value={notificationMessage}
                  onChange={e => setNotificationMessage(e.target.value)}
                  className='system-notification-input'
                />
              </Field.Root>
              {notificationStatus.type && (
                <Alert
                  className='system-notification-alert'
                  status={notificationStatus.type === 'success' ? 'success' : 'error'}>
                  <AlertDescription>{notificationStatus.message}</AlertDescription>
                </Alert>
              )}
              <Button className='system-notification-button' onClick={handleNotificationSubmit}>
                Send Notification to All Users
              </Button>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default AdminDashboard;
