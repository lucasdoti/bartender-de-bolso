import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';
import { glassMap } from './glasses/Glasses';

// ─── DIFFICULTY DOTS ──────────────────────────────────────────────────────────
export const DifficultyDots = ({ level }) => {
  const map = { Fácil: 1, Médio: 2, Difícil: 3 };
  const filled = map[level] || 1;
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3].map(i => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i <= filled ? colors.text : '#ddd',
          }}
        />
      ))}
    </View>
  );
};

// ─── STAR RATING ──────────────────────────────────────────────────────────────
export const StarRating = ({ rating }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Text key={i} style={{ fontSize: 10, opacity: i <= rating ? 1 : 0.2 }}>⭐</Text>
    ))}
  </View>
);

// ─── DRINK CARD (LIST) ────────────────────────────────────────────────────────
export const DrinkCardList = ({ drink, onPress, onFavorite, isFavorite }) => {
  const GlassComponent = glassMap[drink.id];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.listCard}
    >
      <View style={[styles.glassContainer, { backgroundColor: drink.color, borderColor: drink.accent + '22' }]}>
        {GlassComponent && <GlassComponent size={44} />}
      </View>
      <View style={styles.listInfo}>
        <View style={styles.listRow}>
          <Text style={styles.drinkName}>{drink.name}</Text>
          <View style={[styles.tag, { backgroundColor: drink.color }]}>
            <Text style={[styles.tagText, { color: drink.accent }]}>{drink.base}</Text>
          </View>
        </View>
        <View style={styles.listMeta}>
          <Text style={styles.metaText}>⏱ {drink.time}</Text>
          <DifficultyDots level={drink.difficulty} />
          <Text style={styles.metaText}>{drink.difficulty}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onFavorite} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={{ fontSize: 18 }}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ─── DRINK CARD (GRID) ────────────────────────────────────────────────────────
export const DrinkCardGrid = ({ drink, onPress, onFavorite, isFavorite }) => {
  const GlassComponent = glassMap[drink.id];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.gridCard}
    >
      <View style={[styles.gridGlass, { backgroundColor: drink.color }]}>
        <TouchableOpacity
          onPress={onFavorite}
          style={styles.gridFav}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={{ fontSize: 13 }}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        {GlassComponent && <GlassComponent size={44} />}
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.drinkName}>{drink.name}</Text>
        <Text style={styles.metaTextSm}>{drink.base}</Text>
        <View style={[styles.listMeta, { marginTop: spacing.xs }]}>
          <DifficultyDots level={drink.difficulty} />
          <Text style={styles.metaTextSm}>{drink.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // LIST
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  glassContainer: {
    width: 62,
    height: 62,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
  },
  listInfo: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drinkName: {
    fontSize: 15,
    fontFamily: fonts.extraBold,
    color: colors.text,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
  },
  tagText: {
    fontSize: 10,
    fontFamily: fonts.extraBold,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.textLight,
  },
  favBtn: {
    flexShrink: 0,
  },

  // GRID
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  gridGlass: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  gridFav: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    padding: 12,
    gap: 2,
  },
  metaTextSm: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.textLight,
  },
});
