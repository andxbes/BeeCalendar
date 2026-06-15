import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { createElement, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { formatDateUk, parseLocalDate, toLocalDateString } from "@/lib/dates";

type Props = {
  /** Локальна дата YYYY-MM-DD */
  value: string;
  onChange: (isoDate: string) => void;
};

function WebDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (isoDate: string) => void;
}) {
  return createElement("input", {
    type: "date",
    value,
    onChange: (event: { target: { value: string } }) => {
      const next = event.target.value;
      if (next) {
        onChange(next);
      }
    },
    style: {
      fontSize: 16,
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #888",
      width: "100%",
      boxSizing: "border-box",
      marginTop: 8,
    },
  });
}

export function StartDatePicker({ value, onChange }: Props) {
  const date = parseLocalDate(value);
  const [showIosPicker, setShowIosPicker] = useState(false);

  const applyDate = (selected: Date) => {
    onChange(toLocalDateString(selected));
  };

  const handlePickerChange = (
    event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === "android") {
      if (event.type !== "set" || !selected) {
        return;
      }
      applyDate(selected);
      return;
    }

    if (Platform.OS === "ios" && selected) {
      applyDate(selected);
    }
  };

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        mode: "date",
        onChange: handlePickerChange,
      });
      return;
    }

    if (Platform.OS === "ios") {
      setShowIosPicker((visible) => !visible);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View>
        <ThemedText style={styles.dateLabel}>
          {formatDateUk(date)}
        </ThemedText>
        <WebDateInput value={value} onChange={onChange} />
        <ThemedText style={styles.hint}>
          Оберіть дату прищепки в полі вище
        </ThemedText>
      </View>
    );
  }

  return (
    <View>
      <Pressable style={styles.button} onPress={openPicker}>
        <ThemedText style={styles.buttonText}>{formatDateUk(date)}</ThemedText>
        <ThemedText style={styles.hint}>
          {Platform.OS === "ios" && showIosPicker
            ? "Сховати календар"
            : "Натисніть, щоб змінити дату"}
        </ThemedText>
      </Pressable>

      {Platform.OS === "ios" && showIosPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={handlePickerChange}
          locale="uk-UA"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(33, 150, 243, 0.15)",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
});
