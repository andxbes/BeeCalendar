import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export function NewCalendarModal({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const borderColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
    setName("");
    onClose();
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.content}>
            <ThemedText type="subtitle">Новый календарь</ThemedText>
            <ThemedText style={styles.hint}>
              Укажите название партии или улья (например, «Нуклеус №3»).
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { borderColor, color: textColor },
              ]}
              placeholder="Название календаря"
              placeholderTextColor={borderColor}
              value={name}
              onChangeText={setName}
              autoFocus
              onSubmitEditing={handleSubmit}
            />
            <View style={styles.actions}>
              <Pressable style={styles.secondaryButton} onPress={handleClose}>
                <ThemedText>Отмена</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, !name.trim() && styles.disabled]}
                onPress={handleSubmit}
                disabled={!name.trim()}
              >
                <ThemedText style={styles.primaryButtonText}>Создать</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  hint: {
    fontSize: 13,
    opacity: 0.75,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2196F3",
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
