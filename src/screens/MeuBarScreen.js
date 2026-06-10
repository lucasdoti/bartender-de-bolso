import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';
import BottomNav from '../components/BottomNav';
import { DrinkCardList } from '../components/DrinkCard';
import { Share } from 'react-native';
import { ingredientCategories } from '../data/ingredients';
import { xaropes, engarrafados } from '../data/recipes';
import { useDrinks } from '../hooks/useDrinks';

const allItems = ingredientCategories.flatMap(c => c.items);

const INGREDIENT_ALIASES = {
  limao_taiti:     'limao',
  limao_siciliano: 'limao',
};

function normalizeIngredient(id) { return INGREDIENT_ALIASES[id] || id; }

function calcMatches(selected, drinks) {
  const normalized = selected.map(normalizeIngredient);
  return drinks.map(drink => {
    const missing = (drink.needs || []).filter(n => !normalized.includes(n));
    const have    = (drink.needs || []).filter(n => normalized.includes(n)).length;
    const total   = (drink.needs || []).length;
    const match   = total > 0 ? Math.round((have / total) * 100) : 0;
    return { ...drink, match, missing };
  }).sort((a, b) => b.match - a.match);
}

const getItem  = (id) => allItems.find(i => i.id === id);

export default function MeuBarScreen({ navigation }) {
  const { ingredients, toggleIngredient, favorites, toggleFavorite } = useApp();
  const drinks = useDrinks();
  const [activeTab, setActiveTab]       = useState('bar');
  const [tempSelected, setTempSelected] = useState([]);
  const [showResults, setShowResults]   = useState(false);
  const [openCat, setOpenCat]           = useState('Destilados');
  const [openRecipe, setOpenRecipe]     = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Calcula o que falta comprar baseado nos favoritos
  const shoppingList = (() => {
    const normalized = ingredients.map(normalizeIngredient);
    const favDrinks = drinks.filter(d => favorites.includes(d.id));
    const needed = new Set(
      favDrinks.flatMap(d => (d.needs || []).filter(n => !normalized.includes(n)))
    );
    return ingredientCategories.flatMap(cat =>
      cat.items
        .filter(item => needed.has(item.id) || needed.has(normalizeIngredient(item.id)))
        .map(item => ({ ...item, cat: cat.cat }))
    );
  })();

  const toggleTemp = (id) =>
    setTempSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const clearTemp = () => { setTempSelected([]); setShowResults(false); };

  const barResults    = calcMatches(ingredients, drinks);
  const barPerfect    = barResults.filter(d => d.match === 100);
  const barPartial    = barResults.filter(d => d.match >= 50 && d.match < 100);
  const searchResults = calcMatches(tempSelected, drinks);
  const searchPerfect = searchResults.filter(d => d.match === 100);
  const searchPartial = searchResults.filter(d => d.match >= 50 && d.match < 100);

  const CategoryList = ({ selected, onToggle }) =>
    ingredientCategories.map(cat => {
      const isOpen = openCat === cat.cat;
      const catSelected = selected.filter(s => cat.items.find(i => i.id === s)).length;
      return (
        <View key={cat.cat} style={[styles.catCard, { marginBottom: 8 }]}>
          <TouchableOpacity onPress={() => setOpenCat(isOpen ? null : cat.cat)} activeOpacity={0.8} style={styles.catHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={styles.catName}>{cat.cat}</Text>
              {catSelected > 0 && (
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{catSelected}</Text>
                </View>
              )}
            </View>
            <Text style={styles.chevron}>{isOpen ? '⌃' : '⌄'}</Text>
          </TouchableOpacity>
          {isOpen && (
            <View style={styles.chipsGrid}>
              {cat.items.map(item => {
                const active = selected.includes(item.id);
                return (
                  <TouchableOpacity key={item.id} onPress={() => onToggle(item.id)} activeOpacity={0.8} style={[styles.chip, active && styles.chipActive]}>
                    {item.SvgIcon
                      ? <item.SvgIcon size={18} />
                      : <Text style={styles.chipEmoji}>{item.emoji}</Text>
                    }
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item.label}</Text>
                    {active && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      );
    });

  const ResultsList = ({ perfect, partial }) => (
    <View style={{ gap: 12 }}>
      {perfect.length > 0 && (
        <>
          <View style={styles.divider}>
            <View style={styles.dividerLine}/><Text style={styles.dividerLabel}>✦ PRONTOS AGORA</Text><View style={styles.dividerLine}/>
          </View>
          <View style={{ gap: 10 }}>
            {perfect.map(drink => (
              <DrinkCardList key={drink.id} drink={drink}
                isFavorite={favorites.includes(drink.id)}
                onPress={() => navigation.navigate('DrinkDetail', { drinkId: drink.id })}
                onFavorite={() => toggleFavorite(drink.id)}
              />
            ))}
          </View>
        </>
      )}
      {partial.length > 0 && (
        <>
          <View style={[styles.divider, { marginTop: 8 }]}>
            <View style={styles.dividerLine}/><Text style={[styles.dividerLabel, { color: '#E65100' }]}>QUASE LÁ</Text><View style={styles.dividerLine}/>
          </View>
          <View style={{ gap: 10 }}>
            {partial.map(drink => (
              <View key={drink.id} style={styles.partialCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Text style={styles.partialName}>{drink.name}</Text>
                  <View style={styles.pctBadge}><Text style={styles.pctText}>{drink.match}%</Text></View>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${drink.match}%`, backgroundColor: drink.accent }]}/>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {drink.missing.map(m => {
                    const item = getItem(m);
                    return item ? <View key={m} style={styles.missingTag}><Text style={styles.missingText}>+ {item.label}</Text></View> : null;
                  })}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      {perfect.length === 0 && partial.length === 0 && (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36 }}>🫗</Text>
          <Text style={styles.emptyTitle}>Nenhum drink encontrado</Text>
          <Text style={styles.emptySub}>Adicione mais ingredientes!</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meu <Text style={styles.titleAccent}>Bar</Text></Text>
          <Text style={styles.subtitle}>Gerencie seus ingredientes</Text>
        </View>
        <AppIcon size={38} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab('bar')} activeOpacity={0.8} style={[styles.tab, activeTab === 'bar' && styles.tabActive]}>
          <Ionicons name={activeTab === 'bar' ? 'wine' : 'wine-outline'} size={16} color={activeTab === 'bar' ? colors.text : colors.textLight} />
          <Text style={[styles.tabLabel, activeTab === 'bar' && styles.tabLabelActive]}>Bar Salvo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('busca')} activeOpacity={0.8} style={[styles.tab, activeTab === 'busca' && styles.tabActive]}>
          <Ionicons name={activeTab === 'busca' ? 'search' : 'search-outline'} size={16} color={activeTab === 'busca' ? colors.text : colors.textLight} />
          <Text style={[styles.tabLabel, activeTab === 'busca' && styles.tabLabelActive]}>Busca Rápida</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('receitas')} activeOpacity={0.8} style={[styles.tab, activeTab === 'receitas' && styles.tabActive]}>
          <Ionicons name={activeTab === 'receitas' ? 'document-text' : 'document-text-outline'} size={16} color={activeTab === 'receitas' ? colors.text : colors.textLight} />
          <Text style={[styles.tabLabel, activeTab === 'receitas' && styles.tabLabelActive]}>Receitas</Text>
        </TouchableOpacity>
      </View>

      {/* ── BAR SALVO ── */}
      {activeTab === 'bar' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredientes no bar ({ingredients.length})</Text>
              {ingredients.length > 0 && (
                <TouchableOpacity onPress={() => ingredients.slice().forEach(id => toggleIngredient(id))}>
                  <Text style={styles.clearBtn}>Limpar tudo</Text>
                </TouchableOpacity>
              )}
            </View>
            <CategoryList selected={ingredients} onToggle={toggleIngredient} />
          </View>

          {ingredients.length > 0 && (
            <View style={styles.section}>
              {/* Lista de Compras */}
              <TouchableOpacity
                onPress={() => setShowShoppingList(v => !v)}
                activeOpacity={0.8}
                style={styles.shoppingBtn}
              >
                <Text style={styles.shoppingBtnText}>🛒 Lista de compras</Text>
                <Text style={styles.shoppingBtnSub}>
                  {shoppingList.length === 0
                    ? 'Você tem tudo para seus favoritos!'
                    : `${shoppingList.length} item${shoppingList.length > 1 ? 'ns' : ''} faltando para seus favoritos`}
                </Text>
              </TouchableOpacity>

              {showShoppingList && (
                <View style={styles.shoppingPanel}>
                  {shoppingList.length === 0 ? (
                    <Text style={styles.shoppingEmpty}>✅ Seu bar já tem tudo para preparar os drinks favoritos!</Text>
                  ) : (
                    <>
                      {ingredientCategories.map(cat => {
                        const catItems = shoppingList.filter(i => i.cat === cat.cat);
                        if (catItems.length === 0) return null;
                        return (
                          <View key={cat.cat} style={{ marginBottom: 12 }}>
                            <Text style={styles.shoppingCat}>{cat.emoji} {cat.cat}</Text>
                            {catItems.map(item => (
                              <View key={item.id} style={styles.shoppingItem}>
                                <Text style={styles.shoppingDot}>·</Text>
                                <Text style={styles.shoppingItemName}>{item.label}</Text>
                              </View>
                            ))}
                          </View>
                        );
                      })}
                      <TouchableOpacity
                        onPress={() => {
                          const text = '🛒 Lista de compras — Bartender de Bolso\n\n' +
                            ingredientCategories.flatMap(cat => {
                              const items = shoppingList.filter(i => i.cat === cat.cat);
                              if (!items.length) return [];
                              return [`${cat.emoji} ${cat.cat}`, ...items.map(i => `  · ${i.label}`), ''];
                            }).join('\n');
                          Share.share({ message: text });
                        }}
                        style={styles.shoppingShareBtn}
                      >
                        <Text style={styles.shoppingShareText}>📤 Compartilhar lista</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              <ResultsList perfect={barPerfect} partial={barPartial} />
            </View>
          )}

          {ingredients.length === 0 && (
            <View style={styles.section}>
              <View style={styles.hintCard}>
                <Text style={{ fontSize: 40, marginBottom: 14 }}>🥃</Text>
                <Text style={styles.hintTitle}>Seu bar está vazio</Text>
                <Text style={styles.hintSub}>Adicione os ingredientes que você tem em casa e descubra os drinks que já pode preparar agora!</Text>
                <TouchableOpacity
                  onPress={() => setOpenCat('Destilados')}
                  activeOpacity={0.85}
                  style={styles.hintBtn}
                >
                  <Text style={styles.hintBtnText}>Adicionar ingredientes →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── BUSCA RÁPIDA ── */}
      {activeTab === 'busca' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.section}>
            <Text style={styles.searchHint}>
              Selecione ingredientes temporariamente para descobrir um drink — sem salvar no seu bar.
            </Text>

            {tempSelected.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <View style={styles.countRow}>
                  <View style={styles.countBadge}>
                    <Text>✅</Text>
                    <Text style={styles.countText}>{tempSelected.length} ingrediente{tempSelected.length > 1 ? 's' : ''}</Text>
                  </View>
                  <TouchableOpacity onPress={clearTemp}><Text style={styles.clearBtn}>Limpar</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
                  {tempSelected.map(id => {
                    const item = getItem(id);
                    return item ? (
                      <TouchableOpacity key={id} onPress={() => toggleTemp(id)} style={styles.selectedChip}>
                        {item.SvgIcon
                          ? <item.SvgIcon size={16} />
                          : <Text style={styles.chipEmoji}>{item.emoji}</Text>
                        }
                        <Text style={styles.selectedChipLabel}>{item.label}</Text>
                        <Text style={styles.removeX}>✕</Text>
                      </TouchableOpacity>
                    ) : null;
                  })}
                </ScrollView>
              </View>
            )}

            {!showResults && <CategoryList selected={tempSelected} onToggle={toggleTemp} />}

            {!showResults && tempSelected.length > 0 && (
              <TouchableOpacity onPress={() => setShowResults(true)} activeOpacity={0.85} style={styles.ctaBtn}>
                <Text style={styles.ctaBtnLabel}>✦ Descobrir</Text>
                <Text style={styles.ctaBtnTitle}>Ver drinks com {tempSelected.length} ingrediente{tempSelected.length > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )}

            {showResults && (
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.sectionTitle}>Resultados</Text>
                  <TouchableOpacity onPress={() => setShowResults(false)}><Text style={styles.clearBtn}>‹ Editar</Text></TouchableOpacity>
                </View>
                <ResultsList perfect={searchPerfect} partial={searchPartial} />
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ── RECEITAS DE BAR ── */}
      {activeTab === 'receitas' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.section}>
            <Text style={styles.searchHint}>
              Receitas de base para montar seu bar. Xaropes caseiros e drinks pré-prontos para facilitar o preparo.
            </Text>

            {/* XAROPES */}
            <View style={styles.recipeSectionHeader}>
              <Text style={styles.recipeSectionTitle}>🍯 Xaropes</Text>
            </View>

            {xaropes.map((recipe, idx) => {
              const isOpen = openRecipe === recipe.id;
              const isFirst = idx === 0;
              return (
                <View key={recipe.id} style={[styles.recipeCard, isFirst && styles.recipeCardFeatured]}>
                  <TouchableOpacity onPress={() => setOpenRecipe(isOpen ? null : recipe.id)} activeOpacity={0.8} style={styles.recipeHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={[styles.recipeBadge, { backgroundColor: recipe.badgeColor + '22', color: recipe.badgeColor }]}>
                          {isFirst ? '★ ' : ''}{recipe.badge}
                        </Text>
                      </View>
                      <Text style={[styles.recipeName, isFirst && { color: '#FFD966' }]}>{recipe.name}</Text>
                      <Text style={styles.recipeMeta}>{recipe.yield} · {recipe.shelf}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={{ fontSize: 24 }}>{recipe.emoji}</Text>
                      <Text style={styles.chevron}>{isOpen ? '⌃' : '⌄'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.recipeBody}>
                      <Text style={styles.recipeSubtitle}>Ingredientes</Text>
                      {recipe.ingredients.map((ing, i) => (
                        <View key={i} style={styles.recipeIngRow}>
                          <Text style={styles.recipeIngAmt}>{ing.amount}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.recipeIngName}>{ing.name}</Text>
                            {ing.tip ? <Text style={styles.recipeIngTip}>{ing.tip}</Text> : null}
                          </View>
                        </View>
                      ))}

                      <Text style={[styles.recipeSubtitle, { marginTop: 16 }]}>Modo de preparo</Text>
                      {recipe.steps.map(step => (
                        <View key={step.num} style={styles.recipeStepRow}>
                          <View style={styles.recipeStepNum}>
                            <Text style={styles.recipeStepNumText}>{step.num}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.recipeStepTitle}>{step.title}</Text>
                            <Text style={styles.recipeStepDesc}>{step.desc}</Text>
                          </View>
                        </View>
                      ))}

                      {recipe.tip && (
                        <View style={styles.recipeTipBox}>
                          <Text style={styles.recipeTipText}>💡 {recipe.tip}</Text>
                        </View>
                      )}

                      {recipe.usedIn && recipe.usedIn.length > 0 && (
                        <View style={{ marginTop: 12 }}>
                          <Text style={styles.recipeSubtitle}>Usado em</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                            {recipe.usedIn.map(name => (
                              <View key={name} style={styles.usedInChip}>
                                <Text style={styles.usedInText}>{name}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            {/* ENGARRAFADOS */}
            <View style={[styles.recipeSectionHeader, { marginTop: 24 }]}>
              <Text style={styles.recipeSectionTitle}>🍾 Drinks Engarrafados</Text>
            </View>

            {engarrafados.map(recipe => {
              const isOpen = openRecipe === recipe.id;
              return (
                <View key={recipe.id} style={styles.recipeCard}>
                  <TouchableOpacity onPress={() => setOpenRecipe(isOpen ? null : recipe.id)} activeOpacity={0.8} style={styles.recipeHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={[styles.recipeBadge, { backgroundColor: recipe.badgeColor + '22', color: recipe.badgeColor }]}>
                          {recipe.badge}
                        </Text>
                      </View>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                      <Text style={styles.recipeMeta}>{recipe.yield} · {recipe.shelf}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={{ fontSize: 24 }}>{recipe.emoji}</Text>
                      <Text style={styles.chevron}>{isOpen ? '⌃' : '⌄'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.recipeBody}>
                      <Text style={styles.recipeSubtitle}>Ingredientes</Text>
                      {recipe.ingredients.map((ing, i) => (
                        <View key={i} style={styles.recipeIngRow}>
                          <Text style={styles.recipeIngAmt}>{ing.amount}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.recipeIngName}>{ing.name}</Text>
                            {ing.tip ? <Text style={styles.recipeIngTip}>{ing.tip}</Text> : null}
                          </View>
                        </View>
                      ))}

                      <Text style={[styles.recipeSubtitle, { marginTop: 16 }]}>Modo de preparo</Text>
                      {recipe.steps.map(step => (
                        <View key={step.num} style={styles.recipeStepRow}>
                          <View style={styles.recipeStepNum}>
                            <Text style={styles.recipeStepNumText}>{step.num}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.recipeStepTitle}>{step.title}</Text>
                            <Text style={styles.recipeStepDesc}>{step.desc}</Text>
                          </View>
                        </View>
                      ))}

                      {recipe.tip && (
                        <View style={styles.recipeTipBox}>
                          <Text style={styles.recipeTipText}>💡 {recipe.tip}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      <BottomNav active="MeuBar" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.xl, paddingBottom: spacing.md },
  title: { fontSize: 26, fontFamily: fonts.displayBold, color: colors.text },
  titleAccent: { fontFamily: fonts.displayItal, color: colors.primary },
  subtitle: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, marginTop: 2 },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.xl, backgroundColor: '#F0F0EC', borderRadius: radius.lg, padding: 4, gap: 4, marginBottom: spacing.md },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  tabActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabLabel: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.textLight },
  tabLabelActive: { color: colors.text },
  section: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontFamily: fonts.extraBold, color: colors.text },
  clearBtn: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.primary },
  searchHint: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  catCard: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 2, borderColor: '#F5F5F5' },
  catHeader: { padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catEmoji: { fontSize: 20 },
  catName: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },
  catBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  catBadgeText: { fontSize: 10, fontFamily: fonts.extraBold, color: '#fff' },
  chevron: { fontSize: 14, color: colors.textLight },
  chipsGrid: { padding: 12, paddingTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 50, backgroundColor: '#F5F5F2' },
  chipActive: { backgroundColor: colors.dark },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: 12, fontFamily: fonts.extraBold, color: '#555' },
  chipLabelActive: { color: '#fff' },
  checkMark: { fontSize: 10, color: colors.primary, marginLeft: 1 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  countBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 2, borderColor: colors.border },
  countText: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text },
  selectedChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, backgroundColor: colors.dark },
  selectedChipLabel: { fontSize: 11, fontFamily: fonts.extraBold, color: '#fff' },
  removeX: { fontSize: 10, color: '#888', marginLeft: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { fontSize: 11, fontFamily: fonts.extraBold, color: '#2E7D32', letterSpacing: 1 },
  partialCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 2, borderColor: '#F5F5F5' },
  partialName: { fontSize: 15, fontFamily: fonts.extraBold, color: colors.text },
  pctBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, backgroundColor: '#FFF3E0' },
  pctText: { fontSize: 10, fontFamily: fonts.extraBold, color: '#E65100' },
  progressBg: { height: 4, backgroundColor: '#F0F0EC', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  missingTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, backgroundColor: '#FFF3E0' },
  missingText: { fontSize: 10, fontFamily: fonts.extraBold, color: '#E65100' },
  ctaBtn: { backgroundColor: colors.dark, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginTop: 8, shadowColor: colors.dark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
  ctaBtnLabel: { fontSize: 11, fontFamily: fonts.extraBold, color: '#B8860B', letterSpacing: 1.2, textTransform: 'uppercase' },
  ctaBtnTitle: { fontSize: 17, fontFamily: fonts.extraBold, color: '#fff', marginTop: 4 },
  hintCard: { backgroundColor: colors.dark, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: '#B8860B44', shadowColor: '#B8860B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6 },
  hintTitle: { fontSize: 18, fontFamily: fonts.extraBold, color: '#FFD966', marginBottom: 8, textAlign: 'center' },
  hintSub: { fontSize: 13, fontFamily: fonts.semiBold, color: '#888', lineHeight: 20, textAlign: 'center' },
  hintBtn: { marginTop: 18, backgroundColor: '#FFD966', borderRadius: radius.lg, paddingVertical: 12, paddingHorizontal: 24 },
  hintBtnText: { fontSize: 13, fontFamily: fonts.extraBold, color: '#1C1A14' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 15, fontFamily: fonts.extraBold, color: colors.text, marginTop: 10 },
  emptySub: { fontSize: 12, fontFamily: fonts.semiBold, color: colors.textLight, marginTop: 4, textAlign: 'center' },

  // Receitas
  recipeSectionHeader: { marginBottom: 10 },
  recipeSectionTitle: { fontSize: 16, fontFamily: fonts.extraBold, color: colors.text },
  recipeCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: '#F5F5F5', marginBottom: 10, overflow: 'hidden' },
  recipeCardFeatured: { backgroundColor: '#1C1A14', borderColor: '#B8860B44' },
  recipeHeader: { padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  recipeBadge: { fontSize: 10, fontFamily: fonts.extraBold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, overflow: 'hidden' },
  recipeName: { fontSize: 15, fontFamily: fonts.extraBold, color: colors.text, marginBottom: 2 },
  recipeMeta: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.textMuted },
  recipeBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderTopWidth: 1, borderTopColor: '#F0F0EC' },
  recipeSubtitle: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  recipeIngRow: { flexDirection: 'row', gap: 12, marginBottom: 8, alignItems: 'flex-start' },
  recipeIngAmt: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.primary, minWidth: 60 },
  recipeIngName: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text },
  recipeIngTip: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.textMuted, marginTop: 1 },
  recipeStepRow: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  recipeStepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  recipeStepNumText: { fontSize: 11, fontFamily: fonts.extraBold, color: '#fff' },
  recipeStepTitle: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text, marginBottom: 2 },
  recipeStepDesc: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, lineHeight: 19 },
  recipeTipBox: { backgroundColor: '#FFF9E6', borderRadius: radius.md, padding: spacing.sm, marginTop: 12, borderLeftWidth: 3, borderLeftColor: '#B8860B' },
  recipeTipText: { fontSize: 12, fontFamily: fonts.semiBold, color: '#7A5C00', lineHeight: 18 },
  usedInChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, backgroundColor: '#F0F0EC' },
  usedInText: { fontSize: 11, fontFamily: fonts.extraBold, color: colors.text },

  // Shopping list
  shoppingBtn: { backgroundColor: '#0D1B2A', borderRadius: radius.lg, padding: spacing.md, marginBottom: 12 },
  shoppingBtnText: { fontSize: 14, fontFamily: fonts.extraBold, color: '#FFD966' },
  shoppingBtnSub: { fontSize: 11, fontFamily: fonts.semiBold, color: '#888', marginTop: 3 },
  shoppingPanel: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: 16, borderWidth: 2, borderColor: '#F0F0EC' },
  shoppingEmpty: { fontSize: 13, fontFamily: fonts.semiBold, color: '#2E7D32', textAlign: 'center', paddingVertical: 8 },
  shoppingCat: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.textMuted, marginBottom: 6, letterSpacing: 0.5 },
  shoppingItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  shoppingDot: { fontSize: 16, color: colors.primary, lineHeight: 20 },
  shoppingItemName: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.text },
  shoppingShareBtn: { marginTop: 12, backgroundColor: '#F0F0EC', borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  shoppingShareText: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text },
});
