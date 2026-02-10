/**
 * 商人货单弹窗
 * 展示商品列表并提供一键购买交互
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from '../../LinearGradient';
import type {
  ShopListDetail,
  ShopGoodView,
} from '../../../stores/useGameStore';

interface ShopListModalProps {
  detail: ShopListDetail | null;
  onClose: () => void;
  onBuy: (selector: string, merchantName: string) => void;
}

const Divider = () => (
  <LinearGradient
    colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
    style={s.divider}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
  />
);

const BuyButton = ({
  disabled,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={s.buyBtnWrap}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <View style={[s.buyBtn, disabled ? s.buyBtnDisabled : null]}>
      <LinearGradient
        colors={
          disabled
            ? ['#CFC8BD', '#C6BFB3', '#B8B0A4']
            : ['#D5CEC0', '#C9C2B4', '#B8B0A0']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text style={[s.buyBtnText, disabled ? s.buyBtnTextDisabled : null]}>
        {disabled ? '售罄' : '购买'}
      </Text>
    </View>
  </TouchableOpacity>
);

const GoodRow = ({
  good,
  onBuy,
}: {
  good: ShopGoodView;
  onBuy: (selector: string) => void;
}) => {
  const stockText = good.stock < 0 ? '不限' : `${good.stock}`;
  const disabled = good.stock === 0;

  return (
    <View style={s.goodRow}>
      <View style={s.goodMain}>
        <View style={s.goodHead}>
          <Text style={s.goodIndex}>{good.index}.</Text>
          <Text style={s.goodName}>{good.name}</Text>
        </View>
        <Text style={s.goodDesc} numberOfLines={2}>
          {good.short}
        </Text>
        <View style={s.goodMetaRow}>
          <Text style={s.goodMeta}>售价: {good.price} 两</Text>
          <Text style={s.goodMeta}>库存: {stockText}</Text>
        </View>
      </View>
      <BuyButton
        disabled={disabled}
        onPress={() => onBuy(String(good.index))}
      />
    </View>
  );
};

export const ShopListModal = ({
  detail,
  onClose,
  onBuy,
}: ShopListModalProps) => {
  if (!detail) return null;

  return (
    <Modal
      visible={!!detail}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={s.card}>
              <LinearGradient
                colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={s.borderOverlay} pointerEvents="none" />

              <View style={s.content}>
                <View style={s.headerRow}>
                  <View>
                    <Text style={s.title}>货单</Text>
                    <Text style={s.merchantName}>{detail.merchantName}</Text>
                  </View>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={s.closeText}>关闭</Text>
                  </TouchableOpacity>
                </View>

                <Divider />

                {detail.goods.length > 0 ? (
                  <ScrollView style={s.goodsScroll} nestedScrollEnabled>
                    {detail.goods.map(good => (
                      <View key={`${good.blueprintId}-${good.index}`}>
                        <GoodRow
                          good={good}
                          onBuy={selector =>
                            onBuy(selector, detail.merchantName)
                          }
                        />
                        <Divider />
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={s.emptyText}>这位商人暂时没有货物。</Text>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 308,
    maxHeight: 520,
    borderRadius: 4,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
  },
  content: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  merchantName: {
    marginTop: 2,
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  closeText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 6,
  },
  goodsScroll: {
    maxHeight: 430,
  },
  goodRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 4,
  },
  goodMain: {
    flex: 1,
    gap: 2,
  },
  goodHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goodIndex: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  goodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    flex: 1,
  },
  goodDesc: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 18,
  },
  goodMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  goodMeta: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  buyBtnWrap: {
    width: 62,
  },
  buyBtn: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
    overflow: 'hidden',
  },
  buyBtnDisabled: {
    borderColor: '#8B7A5A40',
  },
  buyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 1,
  },
  buyBtnTextDisabled: {
    color: '#9A9388',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    paddingVertical: 20,
  },
});
