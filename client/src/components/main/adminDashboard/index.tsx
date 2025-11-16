import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
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
import useAdminDashboard from '../../../hooks/useAdminDashboard';
import useUserContext from '../../../hooks/useUserContext';
import { Navigate } from 'react-router-dom';
import './index.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
  const { user } = useUserContext();
  const { metrics, loading, error } = useAdminDashboard();

  // Check if user is admin
  const isAdmin = user.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/home" />;
  }

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading dashboard metrics...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
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
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Admin Dashboard
          </Heading>
          <Text color="gray.600">Comprehensive metrics and analytics for the platform</Text>
        </Box>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardHeader>
              <Text fontSize="sm" color="gray.600">
                Total Users
              </Text>
            </CardHeader>
            <CardBody>
              <Heading size="xl">{metrics.users.total}</Heading>
              <Text fontSize="sm" color="gray.500">
                {metrics.users.newThisWeek} new this week
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontSize="sm" color="gray.600">
                Total Questions
              </Text>
            </CardHeader>
            <CardBody>
              <Heading size="xl">{metrics.content.questions.total}</Heading>
              <Text fontSize="sm" color="gray.500">
                {metrics.content.questions.unanswered} unanswered
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontSize="sm" color="gray.600">
                Total Views
              </Text>
            </CardHeader>
            <CardBody>
              <Heading size="xl">{metrics.engagement.totalViews.toLocaleString()}</Heading>
              <Text fontSize="sm" color="gray.500">
                Platform engagement
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontSize="sm" color="gray.600">
                Pending Review
              </Text>
            </CardHeader>
            <CardBody>
              <Heading size="xl">{metrics.moderation.pendingReview}</Heading>
              <Text fontSize="sm" color="gray.500">
                Flagged content
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Row 1 */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="md">User Growth (Last 12 Weeks)</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.growth.usersByWeek}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Question Growth (Last 12 Weeks)</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.growth.questionsByWeek}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" name="New Questions" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Row 2 */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="md">Users by Role</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {userRoleData.map((entry, index) => (
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
              <Heading size="md">Content Breakdown</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contentBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Moderation Status</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={moderationStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Detailed Tables */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="md">User Statistics</Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Tbody>
                  <Tr>
                    <Td fontWeight="bold">Total Users</Td>
                    <Td>{metrics.users.total}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">New This Week</Td>
                    <Td>
                      <Badge colorScheme="green">{metrics.users.newThisWeek}</Badge>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">New This Month</Td>
                    <Td>
                      <Badge colorScheme="blue">{metrics.users.newThisMonth}</Badge>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Active (Last 7 Days)</Td>
                    <Td>{metrics.users.active}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Suspended</Td>
                    <Td>
                      <Badge colorScheme="red">{metrics.users.suspended}</Badge>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Regular Users</Td>
                    <Td>{metrics.users.byRole.user}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Moderators</Td>
                    <Td>{metrics.users.byRole.moderator}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Admins</Td>
                    <Td>{metrics.users.byRole.admin}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Content Statistics</Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Tbody>
                  <Tr>
                    <Td fontWeight="bold">Total Questions</Td>
                    <Td>{metrics.content.questions.total}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Questions with Answers</Td>
                    <Td>{metrics.content.questions.withAnswers}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Unanswered</Td>
                    <Td>
                      <Badge colorScheme="orange">{metrics.content.questions.unanswered}</Badge>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Flagged Questions</Td>
                    <Td>
                      <Badge colorScheme="red">{metrics.content.questions.flagged}</Badge>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Total Answers</Td>
                    <Td>{metrics.content.answers.total}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Total Comments</Td>
                    <Td>{metrics.content.comments.total}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Avg Answers/Question</Td>
                    <Td>{metrics.engagement.averageAnswersPerQuestion}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Avg Comments/Answer</Td>
                    <Td>{metrics.engagement.averageCommentsPerAnswer}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Most Used Tags Table */}
        <Card>
          <CardHeader>
            <Heading size="md">Most Used Tags</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Tag Name</Th>
                  <Th isNumeric>Usage Count</Th>
                </Tr>
              </Thead>
              <Tbody>
                {metrics.tags.mostUsed.length > 0 ? (
                  metrics.tags.mostUsed.map((tag, index) => (
                    <Tr key={tag.name}>
                      <Td>
                        <Badge colorScheme="blue">{tag.name}</Badge>
                      </Td>
                      <Td isNumeric>{tag.count}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={2} textAlign="center">
                      No tags available
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <Heading size="md">Engagement Metrics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Total Views
                </Text>
                <Heading size="lg">{metrics.engagement.totalViews.toLocaleString()}</Heading>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Total Upvotes
                </Text>
                <Heading size="lg">{metrics.engagement.totalUpvotes.toLocaleString()}</Heading>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Total Downvotes
                </Text>
                <Heading size="lg">{metrics.engagement.totalDownvotes.toLocaleString()}</Heading>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Additional Statistics */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardHeader>
              <Text fontSize="sm" color="gray.600">
                Communities
              </Text>
            </CardHeader>
            <CardBody>
              <Heading size="lg">{metrics.communities.total}</Heading>
              <Text fontSize="sm" color="gray.500">
                {metrics.communities.public} public, {metrics.communities.private} private
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontSize="sm" color="gray.600">
                Collections
              </Text>
            </CardHeader>
            <CardBody>
              <Heading size="lg">{metrics.collections.total}</Heading>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontSize="sm" color="gray.600">
                Messages
              </Text>
            </CardHeader>
            <CardBody>
              <Heading size="lg">{metrics.messages.total}</Heading>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default AdminDashboard;

