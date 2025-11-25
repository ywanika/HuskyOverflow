import {
  Box,
  Heading,
  VStack,
  Text,
  SimpleGrid,
  Spinner,
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

// Chart colors - using hex values for Recharts compatibility
const COLORS = ['#0A999E', '#48BB78', '#9137B7', '#ED8936', '#CB9F00', '#9E6C00'];

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
      <Box className='admin-loading'>
        <Spinner size='xl' />
        <Text className='admin-loading-text'>Loading dashboard metrics...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className='admin-error'>
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
    <Box className='admin-dashboard'>
      <VStack align='stretch' gap={6}>
        <Box className='admin-dashboard-header'>
          <Heading size='lg' mb={2}>
            Admin Dashboard
          </Heading>
          <Text className='admin-dashboard-subtitle'>
            Comprehensive metrics and analytics for the platform
          </Text>
        </Box>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          <Card className='admin-card'>
            <CardHeader>
              <Text className='admin-card-header'>Total Users</Text>
            </CardHeader>
            <CardBody>
              <Heading className='admin-card-value'>{metrics.users.total}</Heading>
              <Text className='admin-card-subtext'>{metrics.users.newThisWeek} new this week</Text>
            </CardBody>
          </Card>

          <Card className='admin-card'>
            <CardHeader>
              <Text className='admin-card-header'>Total Questions</Text>
            </CardHeader>
            <CardBody>
              <Heading className='admin-card-value'>{metrics.content.questions.total}</Heading>
              <Text className='admin-card-subtext'>
                {metrics.content.questions.unanswered} unanswered
              </Text>
            </CardBody>
          </Card>

          <Card className='admin-card'>
            <CardHeader>
              <Text className='admin-card-header'>Total Views</Text>
            </CardHeader>
            <CardBody>
              <Heading className='admin-card-value'>
                {metrics.engagement.totalViews.toLocaleString()}
              </Heading>
              <Text className='admin-card-subtext'>Platform engagement</Text>
            </CardBody>
          </Card>

          <Card className='admin-card'>
            <CardHeader>
              <Text className='admin-card-header'>Pending Review</Text>
            </CardHeader>
            <CardBody>
              <Heading className='admin-card-value'>{metrics.moderation.pendingReview}</Heading>
              <Text className='admin-card-subtext'>Flagged content</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Row 1 */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <Card className='chart-card'>
            <CardHeader>
              <Heading className='chart-header'>User Growth (Last 12 Weeks)</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={metrics.growth.usersByWeek}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='week' angle={-45} textAnchor='end' height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='count' stroke='#CB9F00' name='New Users' />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card className='chart-card'>
            <CardHeader>
              <Heading className='chart-header'>Question Growth (Last 12 Weeks)</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={metrics.growth.questionsByWeek}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='week' angle={-45} textAnchor='end' height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='count' stroke='#0A999E' name='New Questions' />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Row 2 */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
          <Card className='chart-card'>
            <CardHeader>
              <Heading className='chart-header'>Users by Role</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width='100%' height={250}>
                <PieChart margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <Pie
                    data={userRoleData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill='#CB9F00'
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

          <Card className='chart-card'>
            <CardHeader>
              <Heading className='chart-header'>Content Breakdown</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={contentBreakdown}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='value' fill='#CB9F00' />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card className='chart-card'>
            <CardHeader>
              <Heading className='chart-header'>Moderation Status</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={moderationStatus}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='value' fill='#ED8936' />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Detailed Tables */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <Card className='chart-card'>
            <CardHeader>
              <Heading className='chart-header'>User Statistics</Heading>
            </CardHeader>
            <CardBody>
              <table className='admin-table'>
                <tbody>
                  <tr>
                    <td>Total Users</td>
                    <td>{metrics.users.total}</td>
                  </tr>
                  <tr>
                    <td>New This Week</td>
                    <td>
                      <span className='badge-green'>{metrics.users.newThisWeek}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>New This Month</td>
                    <td>
                      <span className='badge-blue'>{metrics.users.newThisMonth}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Active (Last 7 Days)</td>
                    <td>{metrics.users.active}</td>
                  </tr>
                  <tr>
                    <td>Suspended</td>
                    <td>
                      <span className='badge-red'>{metrics.users.suspended}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Regular Users</td>
                    <td>{metrics.users.byRole.user}</td>
                  </tr>
                  <tr>
                    <td>Moderators</td>
                    <td>{metrics.users.byRole.moderator}</td>
                  </tr>
                  <tr>
                    <td>Admins</td>
                    <td>{metrics.users.byRole.admin}</td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>

          <Card className='chart-card'>
            <CardHeader>
              <Heading className='chart-header'>Content Statistics</Heading>
            </CardHeader>
            <CardBody>
              <table className='admin-table'>
                <tbody>
                  <tr>
                    <td>Total Questions</td>
                    <td>{metrics.content.questions.total}</td>
                  </tr>
                  <tr>
                    <td>Questions with Answers</td>
                    <td>{metrics.content.questions.withAnswers}</td>
                  </tr>
                  <tr>
                    <td>Unanswered</td>
                    <td>
                      <span className='badge-orange'>{metrics.content.questions.unanswered}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Flagged Questions</td>
                    <td>
                      <span className='badge-red'>{metrics.content.questions.flagged}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Total Answers</td>
                    <td>{metrics.content.answers.total}</td>
                  </tr>
                  <tr>
                    <td>Total Comments</td>
                    <td>{metrics.content.comments.total}</td>
                  </tr>
                  <tr>
                    <td>Avg Answers/Question</td>
                    <td>{metrics.engagement.averageAnswersPerQuestion}</td>
                  </tr>
                  <tr>
                    <td>Avg Comments/Answer</td>
                    <td>{metrics.engagement.averageCommentsPerAnswer}</td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Most Used Tags Table */}
        <Card className='chart-card'>
          <CardHeader>
            <Heading className='chart-header'>Most Used Tags</Heading>
          </CardHeader>
          <CardBody>
            <table className='admin-table'>
              <thead>
                <tr>
                  <th>Tag Name</th>
                  <th style={{ textAlign: 'right' }}>Usage Count</th>
                </tr>
              </thead>
              <tbody>
                {metrics.tags.mostUsed.length > 0 ? (
                  metrics.tags.mostUsed.map(tag => (
                    <tr key={tag.name}>
                      <td>
                        <span className='badge-blue'>{tag.name}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{tag.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className='admin-table-center'>
                      No tags available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Engagement Metrics */}
        <Card className='chart-card'>
          <CardHeader>
            <Heading className='chart-header'>Engagement Metrics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <div className='engagement-metric'>
                <Text className='engagement-metric-label'>Total Views</Text>
                <Heading className='engagement-metric-value'>
                  {metrics.engagement.totalViews.toLocaleString()}
                </Heading>
              </div>
              <div className='engagement-metric'>
                <Text className='engagement-metric-label'>Total Upvotes</Text>
                <Heading className='engagement-metric-value'>
                  {metrics.engagement.totalUpvotes.toLocaleString()}
                </Heading>
              </div>
              <div className='engagement-metric'>
                <Text className='engagement-metric-label'>Total Downvotes</Text>
                <Heading className='engagement-metric-value'>
                  {metrics.engagement.totalDownvotes.toLocaleString()}
                </Heading>
              </div>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Additional Statistics */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <Card className='admin-card'>
            <CardHeader>
              <Text className='admin-card-header'>Communities</Text>
            </CardHeader>
            <CardBody>
              <Heading className='admin-card-value'>{metrics.communities.total}</Heading>
              <Text className='admin-card-subtext'>
                {metrics.communities.public} public, {metrics.communities.private} private
              </Text>
            </CardBody>
          </Card>

          <Card className='admin-card'>
            <CardHeader>
              <Text className='admin-card-header'>Collections</Text>
            </CardHeader>
            <CardBody>
              <Heading className='admin-card-value'>{metrics.collections.total}</Heading>
            </CardBody>
          </Card>

          <Card className='admin-card'>
            <CardHeader>
              <Text className='admin-card-header'>Messages</Text>
            </CardHeader>
            <CardBody>
              <Heading className='admin-card-value'>{metrics.messages.total}</Heading>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

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
