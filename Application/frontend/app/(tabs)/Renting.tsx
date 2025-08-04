import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'

export default class Renting extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text> Rental </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                 // take full screen height
    justifyContent: 'center', // vertical center
    alignItems: 'center',     // horizontal center
  },
})
