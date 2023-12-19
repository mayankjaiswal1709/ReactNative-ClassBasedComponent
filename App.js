import React from 'react';
import { View, Text, FlatList, TextInput, ScrollView } from 'react-native';
import { Button, Input, Card, ListItem } from 'react-native-elements';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_BASE_URL = 'https://hn.algolia.com/api/v1/search_by_date';
const INITIAL_PAGE = 0;
const ITEMS_PER_PAGE = 10;

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: [],
      currentPage: INITIAL_PAGE,
      isFetchingMore: false,
      lastFetchedPage: null,
      searchQuery: '',
    };
  }

  fetchPosts = async (page) => {
    try {
      this.setState({ isFetchingMore: true });
      const response = await axios.get(`${API_BASE_URL}?tags=story&page=${page}`);
      const newPosts = response.data.hits;
      this.setState((prevState) => ({
        posts: [...prevState.posts, ...newPosts],
        lastFetchedPage: page,
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      this.setState({ isFetchingMore: false });
    }
  };

  filteredPosts = () => {
    return this.state.posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(this.state.searchQuery.toLowerCase())
      );
    });
  };

  componentDidMount() {
    this.fetchPosts(this.state.currentPage);
  }

  handleEndReached = () => {
    if (!this.state.isFetchingMore && this.state.lastFetchedPage !== this.state.currentPage) {
      const nextPage = this.state.currentPage + 1;
      this.setState({ currentPage: nextPage });
      this.fetchPosts(nextPage);
    }
  };

  handleMomentumScrollBegin = () => {
    this.handleEndReached();
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query });
  };

  totalPages = () => {
    return Math.ceil(this.state.posts.length / ITEMS_PER_PAGE);
  };

  handlePagination = (page) => {
    this.setState({ currentPage: page });
  };

  renderItem = ({ item }) => {
    const { navigation } = this.props;
    return (
      <Card containerStyle={styles.postContainer}>
        <Card.Title style={styles.postTitle}>{item.title}</Card.Title>
        <ListItem.Subtitle style={styles.postInfo}>{`Author: ${item.author}`}</ListItem.Subtitle>
        <ListItem.Subtitle style={[styles.postInfo, styles.urlText]}>
          {item.url ? `URL: ${item.url}` : 'No URL available'}
        </ListItem.Subtitle>
        <ListItem.Subtitle style={styles.postInfo}>{`Created At: ${item.created_at}`}</ListItem.Subtitle>
        <ListItem.Subtitle style={styles.postInfo}>{`Tags: ${item._tags.join(', ')}`}</ListItem.Subtitle>
        <Button
          title="View Post Details"
          onPress={() => navigation.navigate('PostDetails', { post: item })}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.viewJsonButton}
        />
      </Card>
    );
  };

  // renderHeaderRight = () => (
  //   <Ionicons
  //     name="arrow-forward"
  //     size={30}
  //     color="black"
  //     style={styles.icon}
  //     onPress={() => this.props.navigation.navigate('AnotherPage')}
  //   />
  // );

  // renderHeaderLeft = () => (
  //   <Ionicons
  //     name="arrow-back"
  //     size={30}
  //     color="black"
  //     style={styles.icon}
  //     onPress={() => this.props.navigation.goBack()}
  //   />
  // );

  render() {
    const { searchQuery, posts, currentPage } = this.state;

    const paginatedPosts = posts?.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const displayedPosts = searchQuery ? this.filteredPosts() : paginatedPosts;

    return (
      <View style={styles.container}>
        <Input
          placeholder="Search by title or author"
          value={searchQuery}
          onChangeText={this.handleSearch}
          inputContainerStyle={styles.searchInputContainer}
          placeholderTextColor="black"
        />
        <Text style={styles.sectionHeader}>
          ALL News Posts
        </Text>
        <FlatList
          data={displayedPosts}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={this.handleEndReached}
          onEndReachedThreshold={0.1}
          onMomentumScrollBegin={this.handleMomentumScrollBegin}
          ListFooterComponent={
            <View>
              <FlatList
                horizontal
                data={Array.from({ length: this.totalPages() }, (_, i) => i + 1)}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <Button
                    title={item.toString()}
                    onPress={() => this.handlePagination(item)}
                    containerStyle={styles.paginationButtonContainer}
                    buttonStyle={
                      currentPage === item
                        ? [styles.paginationButton, styles.activePaginationButton]
                        : styles.paginationButton
                    }
                  />
                )}
              />
            </View>
          }
        />
      </View>
    );
  }
}

class PostDetailsScreen extends React.Component {
  render() {
    const { route } = this.props;
    const { post } = route.params;

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.sectionHeader}>
          Post Details in raw JSON.
        </Text>
        <Card containerStyle={styles.jsonContainer}>
          <Text style={styles.jsonText}>{JSON.stringify(post, null, 2)}</Text>
        </Card>
      </ScrollView>
    );
  }
}

const Stack = createStackNavigator();

class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' } }}
          />
          <Stack.Screen
            name="PostDetails"
            component={PostDetailsScreen}
            options={{ cardStyle: { backgroundColor: 'transparent' } }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
const styles = {
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffe4c4',
  },
  postContainer: {
    padding: 10,
    borderRadius: 18,
    backgroundColor: 'white',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 15,
      height: 15,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 25,

  },
  postTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'black',
  },
  postInfo: {
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    color: 'black',
    fontFamily: 'Roboto',
    marginBottom:10
    
  },
  searchInputContainer: {
    marginTop: 40,
    color: 'black',
  },
  
  buttonContainer: {
    marginTop: 10,
    shadowColor: '#d2691e',
    shadowOffset: {
      width: 15,
      height: 15,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 25,
  },
  viewJsonButton: {
    backgroundColor: '#ff7f50',
  },
  paginationButtonContainer: {
    marginHorizontal: 5,
  },
  paginationButton: {
    backgroundColor: '#808080',
  },
  activePaginationButton: {
    backgroundColor: '#ff7f50',
  },
  urlText: {
    fontSize: 13,
    color: 'blue',
  },
  jsonContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  jsonKey: {
    fontWeight: 'bold',
  },
  jsonValue: {
    marginBottom: 5,
  },
  jsonText:{
    fontFamily: 'Courier New',
    fontSize: 13,
    color: 'black',
    fontWeight: 'bold',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
};

export default App;
