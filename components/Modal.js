import {Modal, StyleSheet} from 'react-native';
import AppRoundButton from './AppRoundButton';
import colors from '../config/color';

function Modal() {
    return (
      <View>
        <Modal style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AppRoundButton title={X} onPress={toggleModal}/>
          </View>
        </Modal>
      </View>
    );
  }

  const styles = StyleSheet.create({
    closeModalButton: {
      height:32,
      width:32,
      borderRadius: 16,

    },
    modalContainer: {
      paddingHorizontal:16, 
      paddingVertical: 64
    },
    modalContent: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.lightGrey,
      padding:16 
    }
  })

  export default Modal;