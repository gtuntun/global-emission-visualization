import json
id=''
name=''
age=''


def transjson(jsonpath, csvpath):
     fw = open(jsonpath, 'w', encoding='utf8')   # 打开json文件
     fo = open(csvpath, 'r', newline='')    # 打开csv文件

     ls = []
     for line in fo:
         line = line.replace("\n", "")
         line = line.replace("\r", "")  # 将换行换成空
         ls.append(line.split(","))  # 以，为分隔符
     # print(ls)
     #写入
     for i in range(1, len(ls)):  # 遍历文件的每一行内容，除了列名
         # print(ls[i])
         # if (ls[i].get('id') == '1'):
         #     ls[i].append('message')
         ls[i] = dict(zip(ls[0], ls[i]))  # ls[0]为列名，所以为key,ls[i]为value,
         # zip()是一个内置函数，将两个长度相同的列表组合成一个关系对
         if (ls[i].get('id') == '1'):
             ls[i]['message']='{a: 1,b: 2}'
             print(ls[i])


     json.dump(ls[1:], fw, indent=4)
     #将Python数据类型转换成json格式，编码过程
     #默认是顺序存放，sort_keys是对字典元素按照key进行排序
     #indet参数用语增加数据缩进，使文件更具有可读性

     # 关闭文件
     fo.close()
     fw.close()
transjson('hale.json','hale.csv')
