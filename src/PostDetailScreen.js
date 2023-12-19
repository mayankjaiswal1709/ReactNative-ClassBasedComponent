import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const PostDetailsScreen = ({ route }) => {
  const { post } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Post Details</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.postDetails}>{formatPostDetails(post)}</Text>
      </ScrollView>
    </View>
  );
};

const formatPostDetails = (post) => {
  const { title, author, url, created_at, _tags } = post;

  return `Title: ${title}\n\nAuthor: ${author}\n\nURL: ${url}\n\nCreated At: ${created_at}\n\nTags: ${_tags.join(', ')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    color: 'black',
  },
  scrollViewContent: {
    padding: 20,
  },
  postDetails: {
    fontSize: 16,
    color: 'black',
  },
});

export default PostDetailsScreen;
