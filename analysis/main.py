import pandas as pd
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns

def load_data(filename):
    """Load and return dataset as DataFrame."""
    return pd.read_csv(Path(__file__).parent / filename)

def get_basic_stats(df):
    """Calculate basic statistics for numeric columns."""
    return df.describe()

def analyze_submissions(df):
    """Analyze submission wins and create visualization."""
    # filter for submission wins
    sub_wins = df[df['method'] == 'SUB']
    # get submission types and their counts
    sub_types = sub_wins['method_detailed'].value_counts()
    # calculate win rates
    total_fights = df.shape[0]
    sub_stats = []
    for sub_type, count in sub_types.items():
        win_rate = (count / total_fights) * 100
        sub_stats.append({'submission': sub_type, 'win_rate': win_rate, 'total': count})
    # create and save plot
    stats_df = pd.DataFrame(sub_stats)
    stats_df = stats_df[stats_df['total'] > 5].sort_values('win_rate', ascending=False)
    plt.figure(figsize=(12, 6))
    sns.barplot(data=stats_df, x='submission', y='win_rate')
    plt.xticks(rotation=45, ha='right')
    plt.title('Submission Win Rates (min 5 attempts)')
    plt.ylabel('Win Rate (%)')
    plt.tight_layout()
    plt.savefig('submission_analysis.png')
    return stats_df

def analyze_dataset(filename):
    """Analyze dataset and print key statistics."""
    df = load_data(filename)
    print(f'\nAnalyzing {filename}:')
    print(f'Shape: {df.shape}')
    print('\nBasic stats:')
    print(get_basic_stats(df))
    print('\nMissing values:')
    print(df.isnull().sum())
    if 'medium_dataset.csv' in filename:
        print('\nSubmission Analysis:')
        print(analyze_submissions(df))

if __name__ == '__main__':
    datasets = ['medium_dataset.csv', 'large_dataset.csv']
    for dataset in datasets:
        analyze_dataset(dataset)
