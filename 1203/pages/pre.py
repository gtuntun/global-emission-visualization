import pandas as pd

# 读取两个CSV文件
country_data = pd.read_csv('pages/all_data.csv',dtype={'Country Code': int})
data_csv = pd.read_csv('pages/data.csv')

# 根据"Country"列合并两个数据框
merged_data = pd.merge(data_csv, country_data[['Country', 'Country Code']], on='Country', how='left')

# 将"Country Code"列添加到"data.csv"
data_csv['Country Code'] = merged_data['Country Code'].astype(int)

# 保存合并后的结果
data_csv.to_csv('merged_data.csv', index=False)
